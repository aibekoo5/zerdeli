import json
from typing import List
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.models import Test, Question, AnswerOption, TestAttempt, TestAnswer, LeaderboardPoint, Notification
from app.schemas.schemas import TestSubmitRequest, TestAttemptResult, TestAnswerResult

class TestService:
    @staticmethod
    async def get_tests(db: AsyncSession, direction: str = None):
        query = select(Test).where(Test.is_published == True).options(
            selectinload(Test.questions).selectinload(Question.options)
        )
        if direction and direction.lower() != 'all':
            query = query.where(Test.direction == direction)
        res = await db.execute(query)
        tests = res.scalars().all()
        return tests

    @staticmethod
    async def get_test_by_id(db: AsyncSession, test_id: str):
        query = select(Test).where(Test.id == test_id).options(
            selectinload(Test.questions).selectinload(Question.options)
        )
        res = await db.execute(query)
        test = res.scalars().first()
        if not test:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Тест табылмады")
        return test

    @staticmethod
    async def submit_test(
        db: AsyncSession,
        student_id: str,
        test_id: str,
        submit_data: TestSubmitRequest
    ) -> TestAttemptResult:
        test = await TestService.get_test_by_id(db, test_id)
        
        # Build question dictionary
        questions_dict = {q.id: q for q in test.questions}
        total_max_points = sum(q.points for q in test.questions)
        earned_points = 0.0
        
        answer_results = []
        db_answers = []

        submitted_answers_dict = {ans.question_id: ans for ans in submit_data.answers}

        for question in test.questions:
            user_input = submitted_answers_dict.get(question.id)
            selected_ids = user_input.selected_option_ids if user_input else []
            numerical_val = user_input.numerical_answer if user_input else None

            is_correct = False
            pts_earned = 0.0

            if question.question_type in ["single_choice", "multiple_choice", "true_false"]:
                # Get correct option IDs
                correct_ids = {opt.id for opt in question.options if opt.is_correct}
                user_ids_set = set(selected_ids)
                if correct_ids and user_ids_set == correct_ids:
                    is_correct = True
                    pts_earned = float(question.points)
            elif question.question_type == "numerical":
                # Find correct numerical answer option text
                correct_num = next((opt.option_text.strip() for opt in question.options if opt.is_correct), None)
                if numerical_val and correct_num and numerical_val.strip() == correct_num:
                    is_correct = True
                    pts_earned = float(question.points)

            earned_points += pts_earned

            db_ans = TestAnswer(
                question_id=question.id,
                selected_option_ids=json.dumps(selected_ids),
                numerical_answer=numerical_val,
                is_correct=is_correct,
                points_earned=pts_earned
            )
            db_answers.append(db_ans)

            answer_results.append(
                TestAnswerResult(
                    question_id=question.id,
                    question_text=question.question_text,
                    selected_option_ids=selected_ids,
                    numerical_answer=numerical_val,
                    is_correct=is_correct,
                    points_earned=pts_earned,
                    max_points=float(question.points),
                    explanation=question.explanation
                )
            )

        percentage = round((earned_points / total_max_points * 100), 1) if total_max_points > 0 else 100.0
        passed = percentage >= test.passing_score

        attempt = TestAttempt(
            student_id=student_id,
            test_id=test_id,
            score=earned_points,
            max_score=total_max_points,
            percentage=percentage,
            passed=passed,
            completed_at=datetime.now(timezone.utc),
            answers=db_answers
        )
        db.add(attempt)

        # Update Leaderboard Points
        lb_stmt = select(LeaderboardPoint).where(LeaderboardPoint.student_id == student_id)
        lb_res = await db.execute(lb_stmt)
        lb = lb_res.scalars().first()
        added_points = int(earned_points * 10)
        if lb:
            lb.total_points += added_points
            lb.weekly_points += added_points
            lb.monthly_points += added_points
        else:
            lb = LeaderboardPoint(
                student_id=student_id,
                total_points=added_points,
                weekly_points=added_points,
                monthly_points=added_points
            )
            db.add(lb)

        # Add Notification
        notif = Notification(
            user_id=student_id,
            title=f"Тест нәтижесі: {test.title}",
            message=f"Сіздің нәтижеңіз: {percentage}% ({earned_points}/{total_max_points} балл). {'Құттықтаймыз, өттіңіз! 🎉' if passed else 'Қайтадан тапсырып көріңіз 💪'}",
            type="test_result"
        )
        db.add(notif)

        await db.commit()
        await db.refresh(attempt)

        return TestAttemptResult(
            attempt_id=attempt.id,
            test_id=test.id,
            test_title=test.title,
            score=earned_points,
            max_score=total_max_points,
            percentage=percentage,
            passed=passed,
            started_at=attempt.started_at,
            completed_at=attempt.completed_at or datetime.now(timezone.utc),
            answers=answer_results
        )
