'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/lib/AppContext'
import { generateId } from '@/lib/storage'
import { SCHOOLS, STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/constants'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import InlineEdit from '@/components/ui/InlineEdit'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import type { Task, Priority } from '@/lib/types'

export default function ExamPage() {
  const { state, updateExamPrep } = useApp()
  const { examPrep, schools } = state

  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
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
      updateExamPrep({
        tasks: examPrep.tasks.map((t) =>
          t.id === editingTask.id
            ? { ...t, title: taskForm.title, deadline: taskForm.deadline || undefined, priority: taskForm.priority }
            : t
        ),
      })
    } else {
      const task: Task = {
        id: generateId(),
        title: taskForm.title,
        category: 'exam',
        deadline: taskForm.deadline || undefined,
        priority: taskForm.priority,
        completed: false,
        createdAt: new Date().toISOString(),
      }
      updateExamPrep({ tasks: [...examPrep.tasks, task] })
    }
    setTaskForm({ title: '', deadline: '', priority: 'medium' })
    setShowTaskModal(false)
  }

  const toggleTask = (id: string) => {
    updateExamPrep({
      tasks: examPrep.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    })
  }

  const deleteTask = (id: string) => {
    updateExamPrep({ tasks: examPrep.tasks.filter((t) => t.id !== id) })
  }

  const pending = examPrep.tasks.filter((t) => !t.completed)
  const done = examPrep.tasks.filter((t) => t.completed)

  return (
    <div className="p-8">
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-wide">院試対策</h2>
        <p className="text-xs text-slate-500 mt-0.5">全体方針・タスク・志望校別の進捗を管理する</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Left: memos */}
        <div className="space-y-5">
          <Card>
            <CardHeader title="全体の対策方針" accent />
            <CardBody>
              <InlineEdit
                value={examPrep.overview}
                onSave={(v) => updateExamPrep({ overview: v })}
                placeholder="院試全体の対策方針・スケジュールなどを記録"
                multiline
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="研究計画書メモ（共通）" accent />
            <CardBody>
              <InlineEdit
                value={examPrep.researchPlanMemo}
                onSave={(v) => updateExamPrep({ researchPlanMemo: v })}
                placeholder="各校共通の研究計画書ネタ・方向性を記録"
                multiline
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="面接対策メモ（共通）" accent />
            <CardBody>
              <InlineEdit
                value={examPrep.interviewPrep}
                onSave={(v) => updateExamPrep({ interviewPrep: v })}
                placeholder="面接で想定される質問・回答方針を記録"
                multiline
              />
            </CardBody>
          </Card>

          {/* School progress summary */}
          <Card>
            <CardHeader title="志望校別の進捗" accent />
            <CardBody className="p-0">
              {Object.values(SCHOOLS).map((school) => {
                const data = schools[school.id]
                const total = data.tasks.length
                const done = data.tasks.filter((t) => t.completed).length
                const href = `/schools/${school.id.replace('_', '-')}`
                return (
                  <Link
                    key={school.id}
                    href={href}
                    className="flex items-center gap-4 px-5 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{school.name}</p>
                      {total > 0 && (
                        <p className="text-xs text-slate-400">{done}/{total} タスク完了</p>
                      )}
                    </div>
                    <Badge className={STATUS_COLORS[data.status]}>
                      {STATUS_LABELS[data.status]}
                    </Badge>
                    <span className="text-xs text-slate-400">→</span>
                  </Link>
                )
              })}
            </CardBody>
          </Card>
        </div>

        {/* Right: tasks */}
        <div>
          <Card>
            <CardHeader
              title="院試タスク"
              subtitle={`未完了 ${pending.length}件`}
              accent
              action={
                <button
                  onClick={openAddModal}
                  className="px-2.5 py-1 bg-slate-800 text-white text-xs hover:bg-slate-700 transition-colors"
                >
                  + タスク追加
                </button>
              }
            />
            <CardBody className="p-0">
              {pending.length === 0 && done.length === 0 && (
                <p className="text-sm text-slate-400 italic p-5">タスクなし</p>
              )}
              {/* Pending tasks */}
              {pending.map((t) => (
                <TaskRow key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} onEdit={openEditModal} />
              ))}
              {/* Done section */}
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
            <button
              onClick={() => setShowTaskModal(false)}
              className="px-4 py-1.5 text-sm text-slate-500 border border-slate-200 hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              onClick={saveTask}
              className="px-4 py-1.5 text-sm bg-slate-800 text-white hover:bg-slate-700"
            >
              {editingTask ? '保存' : '追加'}
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
        {task.deadline && (
          <p className="text-xs text-slate-400">{task.deadline}</p>
        )}
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
