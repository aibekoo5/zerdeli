'use client';

import React from 'react';
import { CourseStructureEditor } from '@/components/CourseStructureEditor';

export default function TeacherCourseEditorPage() {
  return <CourseStructureEditor backHref="/teacher/courses" />;
}
