'use client'

import { useState } from 'react'
import { useApp } from '@/lib/AppContext'
import { generateId } from '@/lib/storage'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import InlineEdit from '@/components/ui/InlineEdit'
import Modal from '@/components/ui/Modal'
import type { Reference, TeacherComment, Draft, TimetableItem } from '@/lib/types'

export default function ThesisPage() {
  const { state, updateThesis } = useApp()
  const { thesis } = state

  const [showRefModal, setShowRefModal] = useState(false)
  const [editingRef, setEditingRef] = useState<Reference | null>(null)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [editingComment, setEditingComment] = useState<TeacherComment | null>(null)
  const [showDraftModal, setShowDraftModal] = useState(false)
  const [showTimetableModal, setShowTimetableModal] = useState(false)
  const [editingTimetable, setEditingTimetable] = useState<TimetableItem | null>(null)
  const [editingActionIndex, setEditingActionIndex] = useState<number | null>(null)
  const [editingActionValue, setEditingActionValue] = useState('')
  const [newAction, setNewAction] = useState('')
  const [timetableForm, setTimetableForm] = useState({ period: '', task: '' })

  const [refForm, setRefForm] = useState({
    title: '', author: '', year: '', journal: '', notes: '',
    background: '', researchQuestion: '', answer: '', utilization: '',
  })
  const [commentForm, setCommentForm] = useState({ content: '', date: new Date().toISOString().slice(0, 10) })
  const [draftForm, setDraftForm] = useState({ title: '', content: '' })

  // --- References ---
  const emptyRefForm = {
    title: '', author: '', year: '', journal: '', notes: '',
    background: '', researchQuestion: '', answer: '', utilization: '',
  }

  const openAddRefModal = () => {
    setEditingRef(null)
    setRefForm(emptyRefForm)
    setShowRefModal(true)
  }

  const openEditRefModal = (r: Reference) => {
    setEditingRef(r)
    setRefForm({
      title: r.title,
      author: r.author ?? '',
      year: r.year ? String(r.year) : '',
      journal: r.journal ?? '',
      notes: r.notes ?? '',
      background: r.background ?? '',
      researchQuestion: r.researchQuestion ?? '',
      answer: r.answer ?? '',
      utilization: r.utilization ?? '',
    })
    setShowRefModal(true)
  }

  const saveReference = () => {
    if (!refForm.title) return
    if (editingRef) {
      updateThesis({
        references: thesis.references.map((r) =>
          r.id === editingRef.id
            ? {
                ...r,
                title: refForm.title,
                author: refForm.author,
                year: refForm.year ? parseInt(refForm.year) : undefined,
                journal: refForm.journal,
                notes: refForm.notes,
                background: refForm.background,
                researchQuestion: refForm.researchQuestion,
                answer: refForm.answer,
                utilization: refForm.utilization,
              }
            : r
        ),
      })
    } else {
      const ref: Reference = {
        id: generateId(),
        title: refForm.title,
        author: refForm.author,
        year: refForm.year ? parseInt(refForm.year) : undefined,
        journal: refForm.journal,
        notes: refForm.notes,
        background: refForm.background,
        researchQuestion: refForm.researchQuestion,
        answer: refForm.answer,
        utilization: refForm.utilization,
      }
      updateThesis({ references: [...thesis.references, ref] })
    }
    setRefForm(emptyRefForm)
    setShowRefModal(false)
  }

  const toggleIncludeInReport = (id: string) => {
    updateThesis({
      references: thesis.references.map((r) =>
        r.id === id ? { ...r, includeInReport: !r.includeInReport } : r
      ),
    })
  }

  const deleteReference = (id: string) => {
    updateThesis({ references: thesis.references.filter((r) => r.id !== id) })
  }

  // --- Comments ---
  const openAddCommentModal = () => {
    setEditingComment(null)
    setCommentForm({ content: '', date: new Date().toISOString().slice(0, 10) })
    setShowCommentModal(true)
  }

  const openEditCommentModal = (c: TeacherComment) => {
    setEditingComment(c)
    setCommentForm({ content: c.content, date: c.date })
    setShowCommentModal(true)
  }

  const saveComment = () => {
    if (!commentForm.content) return
    if (editingComment) {
      updateThesis({
        teacherComments: thesis.teacherComments.map((c) =>
          c.id === editingComment.id ? { ...c, content: commentForm.content, date: commentForm.date } : c
        ),
      })
    } else {
      const comment: TeacherComment = {
        id: generateId(),
        content: commentForm.content,
        date: commentForm.date,
      }
      updateThesis({ teacherComments: [...thesis.teacherComments, comment] })
    }
    setCommentForm({ content: '', date: new Date().toISOString().slice(0, 10) })
    setShowCommentModal(false)
  }

  const deleteComment = (id: string) => {
    updateThesis({ teacherComments: thesis.teacherComments.filter((c) => c.id !== id) })
  }

  // --- Drafts ---
  const addDraft = () => {
    if (!draftForm.title) return
    const draft: Draft = {
      id: generateId(),
      title: draftForm.title,
      content: draftForm.content,
      updatedAt: new Date().toISOString(),
    }
    updateThesis({ drafts: [...thesis.drafts, draft] })
    setDraftForm({ title: '', content: '' })
    setShowDraftModal(false)
  }

  const deleteDraft = (id: string) => {
    updateThesis({ drafts: thesis.drafts.filter((d) => d.id !== id) })
  }

  const updateDraftContent = (id: string, content: string) => {
    updateThesis({
      drafts: thesis.drafts.map((d) =>
        d.id === id ? { ...d, content, updatedAt: new Date().toISOString() } : d
      ),
    })
  }

  // --- Next actions ---
  const addNextAction = () => {
    if (!newAction.trim()) return
    updateThesis({ nextActions: [...thesis.nextActions, newAction.trim()] })
    setNewAction('')
  }

  const startEditAction = (i: number) => {
    setEditingActionIndex(i)
    setEditingActionValue(thesis.nextActions[i])
  }

  const saveEditAction = (i: number) => {
    if (!editingActionValue.trim()) return
    const updated = [...thesis.nextActions]
    updated[i] = editingActionValue.trim()
    updateThesis({ nextActions: updated })
    setEditingActionIndex(null)
  }

  const removeNextAction = (i: number) => {
    updateThesis({ nextActions: thesis.nextActions.filter((_, idx) => idx !== i) })
  }

  // --- Timetable ---
  const openAddTimetableModal = () => {
    setEditingTimetable(null)
    setTimetableForm({ period: '', task: '' })
    setShowTimetableModal(true)
  }

  const openEditTimetableModal = (item: TimetableItem) => {
    setEditingTimetable(item)
    setTimetableForm({ period: item.period, task: item.task })
    setShowTimetableModal(true)
  }

  const saveTimetableItem = () => {
    if (!timetableForm.period.trim() || !timetableForm.task.trim()) return
    if (editingTimetable) {
      updateThesis({
        timetable: (thesis.timetable ?? []).map((t) =>
          t.id === editingTimetable.id ? { ...t, period: timetableForm.period.trim(), task: timetableForm.task.trim() } : t
        ),
      })
    } else {
      const item: TimetableItem = {
        id: generateId(),
        period: timetableForm.period.trim(),
        task: timetableForm.task.trim(),
        done: false,
      }
      updateThesis({ timetable: [...(thesis.timetable ?? []), item] })
    }
    setTimetableForm({ period: '', task: '' })
    setShowTimetableModal(false)
  }

  const toggleTimetableItem = (id: string) => {
    updateThesis({
      timetable: (thesis.timetable ?? []).map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    })
  }

  const deleteTimetableItem = (id: string) => {
    updateThesis({ timetable: (thesis.timetable ?? []).filter((t) => t.id !== id) })
  }

  return (
    <div className="p-8">
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-wide">卒業論文</h2>
        <p className="text-xs text-slate-500 mt-0.5">テーマ・構成・文献・進捗を管理する</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Left column */}
        <div className="space-y-5">
          <Card>
            <CardHeader title="テーマ" accent />
            <CardBody>
              <InlineEdit
                value={thesis.theme}
                onSave={(v) => updateThesis({ theme: v })}
                placeholder="論文テーマを入力してください"
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="問題意識" accent />
            <CardBody>
              <InlineEdit
                value={thesis.problemAwareness}
                onSave={(v) => updateThesis({ problemAwareness: v })}
                placeholder="なぜこの研究をするのか、どのような問題を解こうとしているか"
                multiline
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="仮説" accent />
            <CardBody>
              <InlineEdit
                value={thesis.hypothesis}
                onSave={(v) => updateThesis({ hypothesis: v })}
                placeholder="研究の仮説・リサーチクエスチョン"
                multiline
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="構成案" accent />
            <CardBody>
              <InlineEdit
                value={thesis.structure}
                onSave={(v) => updateThesis({ structure: v })}
                placeholder="第1章：…&#10;第2章：…&#10;第3章：…"
                multiline
              />
            </CardBody>
          </Card>

          {/* Timetable */}
          <Card>
            <CardHeader
              title="時間割"
              subtitle="執筆スケジュール"
              accent
              action={
                <button
                  onClick={openAddTimetableModal}
                  className="px-2.5 py-1 bg-slate-800 text-white text-xs hover:bg-slate-700 transition-colors"
                >
                  + 追加
                </button>
              }
            />
            <CardBody className="p-0">
              {(thesis.timetable ?? []).length === 0 ? (
                <p className="text-sm text-slate-400 italic p-5">スケジュールなし</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 w-8"></th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">期間</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">タスク</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(thesis.timetable ?? []).map((item) => (
                      <tr
                        key={item.id}
                        className={`border-b border-slate-100 last:border-0 group hover:bg-slate-50 ${item.done ? 'opacity-50' : ''}`}
                      >
                        <td className="px-4 py-2.5">
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => toggleTimetableItem(item.id)}
                            className="w-3.5 h-3.5 accent-slate-700"
                          />
                        </td>
                        <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap font-medium">
                          {item.period}
                        </td>
                        <td className={`px-4 py-2.5 text-slate-700 ${item.done ? 'line-through text-slate-400' : ''}`}>
                          {item.task}
                        </td>
                        <td className="px-3 py-2.5 flex gap-2">
                          <button
                            onClick={() => openEditTimetableModal(item)}
                            className="text-slate-300 hover:text-slate-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => deleteTimetableItem(item.id)}
                            className="text-slate-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Next actions */}
          <Card>
            <CardHeader title="次にやること" accent />
            <CardBody>
              <div className="space-y-1.5 mb-3">
                {thesis.nextActions.length === 0 && (
                  <p className="text-sm text-slate-400 italic">タスクなし</p>
                )}
                {thesis.nextActions.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    {editingActionIndex === i ? (
                      <input
                        autoFocus
                        type="text"
                        value={editingActionValue}
                        onChange={(e) => setEditingActionValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditAction(i)
                          if (e.key === 'Escape') setEditingActionIndex(null)
                        }}
                        onBlur={() => saveEditAction(i)}
                        className="flex-1 border border-amber-400 px-2 py-0.5 text-sm text-slate-700 focus:outline-none"
                      />
                    ) : (
                      <>
                        <span className="text-sm text-slate-700 flex-1">{a}</span>
                        <button
                          onClick={() => startEditAction(i)}
                          className="text-slate-300 hover:text-slate-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => removeNextAction(i)}
                          className="text-slate-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          削除
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addNextAction() }}
                  placeholder="新しいタスクを追加..."
                  className="flex-1 border border-slate-200 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={addNextAction}
                  className="px-3 py-1.5 bg-slate-800 text-white text-xs hover:bg-slate-700 transition-colors"
                >
                  追加
                </button>
              </div>
            </CardBody>
          </Card>

          {/* References */}
          <Card>
            <CardHeader
              title="文献一覧"
              subtitle={`${thesis.references.length}件`}
              accent
              action={
                <button
                  onClick={openAddRefModal}
                  className="px-2.5 py-1 bg-slate-800 text-white text-xs hover:bg-slate-700 transition-colors"
                >
                  + 追加
                </button>
              }
            />
            <CardBody className="p-0">
              {thesis.references.length === 0 ? (
                <p className="text-sm text-slate-400 italic p-5">文献なし</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-3 py-2 text-center text-xs font-semibold text-amber-600" title="今週の報告に含める">報告</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">タイトル</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">著者</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">年</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {thesis.references.map((r) => (
                      <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 group">
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={r.includeInReport ?? false}
                            onChange={() => toggleIncludeInReport(r.id)}
                            title="今週の報告に含める"
                            className="w-3.5 h-3.5 accent-amber-500"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <p className="text-xs font-medium text-slate-700">{r.title}</p>
                          {r.notes && <p className="text-xs text-slate-400 mt-0.5">{r.notes}</p>}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">{r.author}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">{r.year}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditRefModal(r)}
                              className="text-slate-300 hover:text-slate-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => deleteReference(r.id)}
                              className="text-slate-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>

          {/* Teacher comments */}
          <Card>
            <CardHeader
              title="指導教員コメント"
              accent
              action={
                <button
                  onClick={openAddCommentModal}
                  className="px-2.5 py-1 bg-slate-800 text-white text-xs hover:bg-slate-700 transition-colors"
                >
                  + 追加
                </button>
              }
            />
            <CardBody className="p-0">
              {thesis.teacherComments.length === 0 ? (
                <p className="text-sm text-slate-400 italic p-5">コメントなし</p>
              ) : (
                <div>
                  {thesis.teacherComments.map((c) => (
                    <div key={c.id} className="px-5 py-3 border-b border-slate-100 last:border-0 group hover:bg-slate-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">{c.date}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditCommentModal(c)}
                            className="text-slate-300 hover:text-slate-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => deleteComment(c.id)}
                            className="text-slate-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Drafts */}
          <Card>
            <CardHeader
              title="下書きメモ"
              accent
              action={
                <button
                  onClick={() => setShowDraftModal(true)}
                  className="px-2.5 py-1 bg-slate-800 text-white text-xs hover:bg-slate-700 transition-colors"
                >
                  + 追加
                </button>
              }
            />
            <CardBody className="p-0">
              {thesis.drafts.length === 0 ? (
                <p className="text-sm text-slate-400 italic p-5">下書きなし</p>
              ) : (
                thesis.drafts.map((d) => (
                  <div key={d.id} className="border-b border-slate-100 last:border-0 group">
                    <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-700">{d.title}</span>
                      <button
                        onClick={() => deleteDraft(d.id)}
                        className="text-slate-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        削除
                      </button>
                    </div>
                    <InlineEdit
                      value={d.content}
                      onSave={(v) => updateDraftContent(d.id, v)}
                      placeholder="内容を入力..."
                      multiline
                    />
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Reference modal */}
      <Modal isOpen={showRefModal} onClose={() => setShowRefModal(false)} title={editingRef ? '文献を編集' : '文献を追加'} size="lg">
        <div className="space-y-4">
          {/* 基本情報 */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">基本情報</p>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">タイトル *</label>
                <input
                  type="text"
                  value={refForm.title}
                  onChange={(e) => setRefForm({ ...refForm, title: e.target.value })}
                  className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">著者</label>
                  <input
                    type="text"
                    value={refForm.author}
                    onChange={(e) => setRefForm({ ...refForm, author: e.target.value })}
                    className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">年</label>
                  <input
                    type="number"
                    value={refForm.year}
                    onChange={(e) => setRefForm({ ...refForm, year: e.target.value })}
                    className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">掲載誌・出版社</label>
                <input
                  type="text"
                  value={refForm.journal}
                  onChange={(e) => setRefForm({ ...refForm, journal: e.target.value })}
                  placeholder="例：会計研究、東洋経済新報社"
                  className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* 内容分析 */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">内容分析</p>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">研究背景</label>
                <textarea
                  value={refForm.background}
                  onChange={(e) => setRefForm({ ...refForm, background: e.target.value })}
                  rows={2}
                  className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Research Question</label>
                <textarea
                  value={refForm.researchQuestion}
                  onChange={(e) => setRefForm({ ...refForm, researchQuestion: e.target.value })}
                  rows={2}
                  className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Answer</label>
                <textarea
                  value={refForm.answer}
                  onChange={(e) => setRefForm({ ...refForm, answer: e.target.value })}
                  rows={2}
                  className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">自分の研究への活用</label>
                <textarea
                  value={refForm.utilization}
                  onChange={(e) => setRefForm({ ...refForm, utilization: e.target.value })}
                  rows={2}
                  className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">メモ</label>
                <textarea
                  value={refForm.notes}
                  onChange={(e) => setRefForm({ ...refForm, notes: e.target.value })}
                  rows={2}
                  className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button onClick={() => setShowRefModal(false)} className="px-4 py-1.5 text-sm text-slate-500 border border-slate-200 hover:bg-slate-50">
              キャンセル
            </button>
            <button onClick={saveReference} className="px-4 py-1.5 text-sm bg-slate-800 text-white hover:bg-slate-700">
              {editingRef ? '保存' : '追加'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Comment modal */}
      <Modal isOpen={showCommentModal} onClose={() => setShowCommentModal(false)} title={editingComment ? 'コメントを編集' : 'コメントを追加'}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">日付</label>
            <input
              type="date"
              value={commentForm.date}
              onChange={(e) => setCommentForm({ ...commentForm, date: e.target.value })}
              className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">コメント内容 *</label>
            <textarea
              value={commentForm.content}
              onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
              rows={4}
              className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowCommentModal(false)} className="px-4 py-1.5 text-sm text-slate-500 border border-slate-200 hover:bg-slate-50">
              キャンセル
            </button>
            <button onClick={saveComment} className="px-4 py-1.5 text-sm bg-slate-800 text-white hover:bg-slate-700">
              {editingComment ? '保存' : '追加'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Draft modal */}
      <Modal isOpen={showDraftModal} onClose={() => setShowDraftModal(false)} title="下書きを追加">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">タイトル *</label>
            <input
              type="text"
              value={draftForm.title}
              onChange={(e) => setDraftForm({ ...draftForm, title: e.target.value })}
              className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">内容</label>
            <textarea
              value={draftForm.content}
              onChange={(e) => setDraftForm({ ...draftForm, content: e.target.value })}
              rows={4}
              className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowDraftModal(false)} className="px-4 py-1.5 text-sm text-slate-500 border border-slate-200 hover:bg-slate-50">
              キャンセル
            </button>
            <button onClick={addDraft} className="px-4 py-1.5 text-sm bg-slate-800 text-white hover:bg-slate-700">
              追加
            </button>
          </div>
        </div>
      </Modal>

      {/* Timetable modal */}
      <Modal isOpen={showTimetableModal} onClose={() => setShowTimetableModal(false)} title={editingTimetable ? 'スケジュールを編集' : 'スケジュールを追加'} size="sm">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">期間 *</label>
            <input
              type="text"
              value={timetableForm.period}
              onChange={(e) => setTimetableForm({ ...timetableForm, period: e.target.value })}
              placeholder="例：4月第1週、5月中旬"
              className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">タスク *</label>
            <input
              type="text"
              value={timetableForm.task}
              onChange={(e) => setTimetableForm({ ...timetableForm, task: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') saveTimetableItem() }}
              placeholder="例：第1章執筆、先行研究調査"
              className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowTimetableModal(false)} className="px-4 py-1.5 text-sm text-slate-500 border border-slate-200 hover:bg-slate-50">
              キャンセル
            </button>
            <button onClick={saveTimetableItem} className="px-4 py-1.5 text-sm bg-slate-800 text-white hover:bg-slate-700">
              {editingTimetable ? '保存' : '追加'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
