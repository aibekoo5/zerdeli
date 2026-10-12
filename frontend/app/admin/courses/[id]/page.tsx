'use client';

import React from 'react';
import { CourseStructureEditor } from '@/components/CourseStructureEditor';

export default function AdminCourseEditorPage() {
  return <CourseStructureEditor backHref="/admin/courses" />;
}
