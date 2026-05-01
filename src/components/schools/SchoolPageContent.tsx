'use client'

import { useState } from 'react'
import { useApp } from '@/lib/AppContext'
import { generateId } from '@/lib/storage'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
} from '@/lib/constants'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import InlineEdit from '@/components/ui/InlineEdit'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import type { SchoolId, Task, Priority, SchoolStatus } from '@/lib/types'

interface Props {
  schoolId: SchoolId
}

export default function SchoolPageContent({ schoolId }: Props) {
  const { state, updateSchool } = useApp()
  const school = state.schools[schoolId]

  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [editingSubjectIndex, setEditingSubjectIndex] = useState<number | null>(null)
  const [newSubject, setNewSubject] = useState('')
  const [taskForm, setTaskForm] = useState({
    title: '',
    deadline: '',
    priority: 'medium' as Priority,
  })

  const openAddModal = () => {
    setEditingTask(null)
    setTaskForm({ title: '', deadline: '', priority: 'medium' })
    setShowTaskModal(true)
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setTaskForm({ title: task.title, deadline: task.deadline ?? '', priority: task.priority })
    setShowTaskModal(true)
  }

  const saveTask = () => {
    if (!taskForm.title.trim()) return
    if (editingTask) {
      updateSchool(schoolId, {
        tasks: school.tasks.map((t) =>
          t.id === editingTask.id
            ? { ...t, title: taskForm.title, deadline: taskForm.deadline || undefined, priority: taskForm.priority }
            : t
        ),
      })
    } else {
      const task: Task = {
        id: generateId(),
        title: taskForm.title,
        category: schoolId,
        deadline: taskForm.deadline || undefined,
        priority: taskForm.priority,
        completed: false,
        createdAt: new Date().toISOString(),
      }
      updateSchool(schoolId, { tasks: [...school.tasks, task] })
    }
    setTaskForm({ title: '', deadline: '', priority: 'medium' })
    setShowTaskModal(false)
  }

  const toggleTask = (id: string) => {
    updateSchool(schoolId, {
      tasks: school.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    })
  }

  const deleteTask = (id: string) => {
    updateSchool(schoolId, { tasks: school.tasks.filter((t) => t.id !== id) })
  }

  const toggleDocument = (id: string) => {
    updateSchool(schoolId, {
      requiredDocuments: school.requiredDocuments.map((d) =>
        d.id === id ? { ...d, completed: !d.completed } : d
      ),
    })
  }

  const openAddSubjectModal = () => {
    setEditingSubjectIndex(null)
    setNewSubject('')
    setShowSubjectModal(true)
  }

  const openEditSubjectModal = (i: number) => {
    setEditingSubjectIndex(i)
    setNewSubject(school.examSubjects[i])
    setShowSubjectModal(true)
  }

  const saveSubject = () => {
    if (!newSubject.trim()) return
    if (editingSubjectIndex !== null) {
      const updated = [...school.examSubjects]
      updated[editingSubjectIndex] = newSubject.trim()
      updateSchool(schoolId, { examSubjects: updated })
    } else {
      updateSchool(schoolId, { examSubjects: [...school.examSubjects, newSubject.trim()] })
    }
    setNewSubject('')
    setShowSubjectModal(false)
  }

  const removeSubject = (i: number) => {
    updateSchool(schoolId, { examSubjects: school.examSubjects.filter((_, idx) => idx !== i) })
  }

  const pending = school.tasks.filter((t) => !t.completed)
  const done = school.tasks.filter((t) => t.completed)
  const docDone = school.requiredDocuments.filter((d) => d.completed).length
  const docTotal = school.requiredDocuments.length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-wide">{school.name}</h2>
          <select
            value={school.status}
            onChange={(e) => updateSchool(schoolId, { status: e.target.value as SchoolStatus })}
            className="border border-slate-200 px-2 py-1 text-xs bg-white focus:outline-none focus:border-amber-400"
          >
            <option value="not_started">未着手</option>
            <option value="in_progress">対策中</option>
            <option value="completed">完了</option>
          </select>
          <Badge className={STATUS_COLORS[school.status]}>
            {STATUS_LABELS[school.status]}
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          書類: {docDone}/{docTotal}完了 ／ タスク: {done.length}/{school.tasks.length}完了
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Left: memos */}
        <div className="space-y-5">
          <Card>
            <CardHeader title="研究計画書メモ" accent />
            <CardBody>
              <InlineEdit
                value={school.researchPlanMemo}
                onSave={(v) => updateSchool(schoolId, { researchPlanMemo: v })}
                placeholder={`${school.name}向けの研究計画書のポイントを記録`}
                multiline
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="面接対策メモ" accent />
            <CardBody>
              <InlineEdit
                value={school.interviewMemo}
                onSave={(v) => updateSchool(schoolId, { interviewMemo: v })}
                placeholder="想定質問・回答方針・アピールポイント"
                multiline
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="学校の特徴メモ" accent />
            <CardBody>
              <InlineEdit
                value={school.characteristicsMemo}
                onSave={(v) => updateSchool(schoolId, { characteristicsMemo: v })}
                placeholder="研究室・カリキュラム・教員・特色など"
                multiline
              />
            </CardBody>
          </Card>

          {/* Exam subjects */}
          <Card>
            <CardHeader
              title="試験科目"
              accent
              action={
                <button
                  onClick={openAddSubjectModal}
                  className="px-2.5 py-1 bg-slate-800 text-white text-xs hover:bg-slate-700 transition-colors"
                >
                  + 追加
                </button>
              }
            />
            <CardBody>
              {school.examSubjects.length === 0 ? (
                <p className="text-sm text-slate-400 italic">未入力</p>
              ) : (
                <ul className="space-y-1.5">
                  {school.examSubjects.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0" />
                      <span className="text-sm text-slate-700 flex-1">{s}</span>
                      <button
                        onClick={() => openEditSubjectModal(i)}
                        className="text-slate-300 hover:text-slate-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => removeSubject(i)}
                        className="text-slate-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        削除
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right: documents & tasks */}
        <div className="space-y-5">
          {/* Required documents */}
          <Card>
            <CardHeader
              title="必要書類"
              subtitle={`${docDone}/${docTotal} 完了`}
              accent
            />
            <CardBody className="p-0">
              {school.requiredDocuments.map((doc) => (
                <label
                  key={doc.id}
                  className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={doc.completed}
                    onChange={() => toggleDocument(doc.id)}
                    className="w-3.5 h-3.5 accent-slate-700 flex-shrink-0"
                  />
                  <span className={`text-sm ${doc.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {doc.name}
                  </span>
                </label>
              ))}
            </CardBody>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader
              title="個別タスク"
              subtitle={`未完了 ${pending.length}件`}
              accent
              action={
                <button
                  onClick={openAddModal}
                  className="px-2.5 py-1 bg-slate-800 text-white text-xs hover:bg-slate-700 transition-colors"
                >
                  + タスク
                </button>
              }
            />
            <CardBody className="p-0">
              {pending.length === 0 && done.length === 0 && (
                <p className="text-sm text-slate-400 italic p-5">タスクなし</p>
              )}
              {pending.map((t) => (
                <TaskRow key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} onEdit={openEditModal} />
              ))}
              {done.length > 0 && (
                <>
                  <div className="px-5 py-2 bg-slate-50 border-y border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">完了済み</span>
                  </div>
                  {done.map((t) => (
                    <TaskRow key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} onEdit={openEditModal} />
                  ))}
                </>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Task modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title={editingTask ? 'タスクを編集' : 'タスクを追加'}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">タスク名 *</label>
            <input
              type="text"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') saveTask() }}
              className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">締切日</label>
              <input
                type="date"
                value={taskForm.deadline}
                onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">優先度</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as Priority })}
                className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400"
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowTaskModal(false)} className="px-4 py-1.5 text-sm text-slate-500 border border-slate-200 hover:bg-slate-50">
              キャンセル
            </button>
            <button onClick={saveTask} className="px-4 py-1.5 text-sm bg-slate-800 text-white hover:bg-slate-700">
              {editingTask ? '保存' : '追加'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Subject modal */}
      <Modal isOpen={showSubjectModal} onClose={() => setShowSubjectModal(false)} title={editingSubjectIndex !== null ? '試験科目を編集' : '試験科目を追加'} size="sm">
        <div className="space-y-3">
          <input
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveSubject() }}
            placeholder="例：研究計画書審査、口述試験"
            className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowSubjectModal(false)} className="px-4 py-1.5 text-sm text-slate-500 border border-slate-200 hover:bg-slate-50">
              キャンセル
            </button>
            <button onClick={saveSubject} className="px-4 py-1.5 text-sm bg-slate-800 text-white hover:bg-slate-700">
              {editingSubjectIndex !== null ? '保存' : '追加'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function TaskRow({
  task,
  onToggle,
  onDelete,
  onEdit,
}: {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
}) {
  return (
    <div className={`flex items-center gap-3 px-5 py-3 border-b border-slate-100 last:border-0 group hover:bg-slate-50 ${task.completed ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="w-3.5 h-3.5 accent-slate-700 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
          {task.title}
        </p>
        {task.deadline && <p className="text-xs text-slate-400">{task.deadline}</p>}
      </div>
      <Badge className={PRIORITY_COLORS[task.priority]}>{PRIORITY_LABELS[task.priority]}</Badge>
      <button
        onClick={() => onEdit(task)}
        className="text-slate-300 hover:text-slate-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
      >
        編集
      </button>
      <button
        onClick={() => onDelete(task.id)}
        className="text-slate-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
      >
        削除
      </button>
    </div>
  )
}
