'use client'

import { useState } from 'react'
import { useApp } from '@/lib/AppContext'
import { generateId } from '@/lib/storage'
import {
  MATERIAL_TYPE_LABELS,
  REUSE_TARGET_LABELS,
} from '@/lib/constants'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import InlineEdit from '@/components/ui/InlineEdit'
import type { CommonMaterial, MaterialType, ReuseTarget } from '@/lib/types'

const TYPE_COLORS: Record<MaterialType, string> = {
  literature: 'bg-blue-100 text-blue-700',
  keyword: 'bg-purple-100 text-purple-700',
  problem_awareness: 'bg-amber-100 text-amber-700',
  motivation: 'bg-emerald-100 text-emerald-700',
  experience: 'bg-rose-100 text-rose-700',
  analysis: 'bg-slate-100 text-slate-600',
}

const ALL_REUSE_TARGETS: ReuseTarget[] = [
  'thesis', 'aoyama', 'meiji', 'chiba_shoka', 'interview', 'research_plan'
]

const ALL_TYPES: MaterialType[] = [
  'literature', 'keyword', 'problem_awareness', 'motivation', 'experience', 'analysis'
]

export default function MaterialsPage() {
  const { state, addMaterial, updateMaterial, deleteMaterial } = useApp()

  const [filterType, setFilterType] = useState<MaterialType | 'all'>('all')
  const [filterTarget, setFilterTarget] = useState<ReuseTarget | 'all'>('all')
  const [filterTag, setFilterTag] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const emptyForm = {
    title: '',
    content: '',
    type: 'literature' as MaterialType,
    tags: '',
    reuseTargets: [] as ReuseTarget[],
  }
  const [form, setForm] = useState(emptyForm)

  // Collect all tags
  const allTags = Array.from(
    new Set(state.materials.flatMap((m) => m.tags))
  ).sort()

  const filtered = state.materials.filter((m) => {
    if (filterType !== 'all' && m.type !== filterType) return false
    if (filterTarget !== 'all' && !m.reuseTargets.includes(filterTarget)) return false
    if (filterTag && !m.tags.includes(filterTag)) return false
    return true
  })

  const openAdd = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (m: CommonMaterial) => {
    setForm({
      title: m.title,
      content: m.content,
      type: m.type,
      tags: m.tags.join(', '),
      reuseTargets: m.reuseTargets,
    })
    setEditingId(m.id)
    setShowModal(true)
  }

  const toggleReuseTarget = (t: ReuseTarget) => {
    setForm((f) => ({
      ...f,
      reuseTargets: f.reuseTargets.includes(t)
        ? f.reuseTargets.filter((x) => x !== t)
        : [...f.reuseTargets, t],
    }))
  }

  const save = () => {
    if (!form.title.trim()) return
    const now = new Date().toISOString()
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    if (editingId) {
      const existing = state.materials.find((m) => m.id === editingId)!
      updateMaterial({
        ...existing,
        title: form.title,
        content: form.content,
        type: form.type,
        tags,
        reuseTargets: form.reuseTargets,
        updatedAt: now,
      })
    } else {
      const m: CommonMaterial = {
        id: generateId(),
        title: form.title,
        content: form.content,
        type: form.type,
        tags,
        reuseTargets: form.reuseTargets,
        createdAt: now,
        updatedAt: now,
      }
      addMaterial(m)
    }
    setShowModal(false)
  }

  return (
    <div className="p-8">
      <div className="mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-wide">共通素材庫</h2>
            <p className="text-xs text-slate-500 mt-0.5">卒論・院試対策で再利用できる素材を蓄積する</p>
          </div>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-slate-800 text-white text-sm hover:bg-slate-700 transition-colors"
          >
            + 素材を追加
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-5">
        <CardBody className="py-3">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Type filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 tracking-wide">種別:</span>
              <button
                onClick={() => setFilterType('all')}
                className={`px-2 py-0.5 text-xs border ${filterType === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
              >
                すべて
              </button>
              {ALL_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2 py-0.5 text-xs border ${filterType === t ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
                >
                  {MATERIAL_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 items-center mt-2.5">
            {/* Target filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 tracking-wide">再利用先:</span>
              <button
                onClick={() => setFilterTarget('all')}
                className={`px-2 py-0.5 text-xs border ${filterTarget === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
              >
                すべて
              </button>
              {ALL_REUSE_TARGETS.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterTarget(t)}
                  className={`px-2 py-0.5 text-xs border ${filterTarget === t ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
                >
                  {REUSE_TARGET_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center mt-2.5">
              <span className="text-xs font-semibold text-slate-500 tracking-wide">タグ:</span>
              <button
                onClick={() => setFilterTag('')}
                className={`px-2 py-0.5 text-xs border ${filterTag === '' ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
              >
                すべて
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`px-2 py-0.5 text-xs border ${filterTag === tag ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Materials count */}
      <p className="text-xs text-slate-500 mb-3">{filtered.length}件 / 合計{state.materials.length}件</p>

      {/* Materials list */}
      {filtered.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-slate-400 italic text-center py-8">
              {state.materials.length === 0
                ? '素材がまだありません。「＋ 素材を追加」から追加してください。'
                : 'フィルター条件に一致する素材がありません。'}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <MaterialCard
              key={m.id}
              material={m}
              onEdit={() => openEdit(m)}
              onDelete={() => deleteMaterial(m.id)}
              onUpdateContent={(content) => {
                updateMaterial({ ...m, content, updatedAt: new Date().toISOString() })
              }}
            />
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? '素材を編集' : '素材を追加'}
        size="lg"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">タイトル *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">種別</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as MaterialType })}
              className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400"
            >
              {ALL_TYPES.map((t) => (
                <option key={t} value={t}>{MATERIAL_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">内容</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={5}
              className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              タグ（カンマ区切り）
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="例：経済学, 格差, 先行研究"
              className="w-full border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">再利用先</label>
            <div className="flex flex-wrap gap-2">
              {ALL_REUSE_TARGETS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleReuseTarget(t)}
                  className={`px-2.5 py-1 text-xs border transition-colors ${
                    form.reuseTargets.includes(t)
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'border-slate-200 text-slate-500 hover:border-slate-400'
                  }`}
                >
                  {REUSE_TARGET_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-1.5 text-sm text-slate-500 border border-slate-200 hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              onClick={save}
              className="px-4 py-1.5 text-sm bg-slate-800 text-white hover:bg-slate-700"
            >
              {editingId ? '保存' : '追加'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function MaterialCard({
  material,
  onEdit,
  onDelete,
  onUpdateContent,
}: {
  material: CommonMaterial
  onEdit: () => void
  onDelete: () => void
  onUpdateContent: (content: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card>
      <div className="flex items-start gap-3 px-5 py-3 border-b border-slate-100">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={TYPE_COLORS[material.type]}>
              {MATERIAL_TYPE_LABELS[material.type]}
            </Badge>
            {material.reuseTargets.map((t) => (
              <Badge key={t} className="bg-slate-100 text-slate-500">
                {REUSE_TARGET_LABELS[t]}
              </Badge>
            ))}
            {material.tags.map((tag) => (
              <Badge key={tag} className="bg-amber-50 text-amber-600 border border-amber-200">
                # {tag}
              </Badge>
            ))}
          </div>
          <h4 className="text-sm font-semibold text-slate-800 mt-1.5">{material.title}</h4>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-slate-400 hover:text-slate-700"
          >
            {expanded ? '折りたたむ' : '展開'}
          </button>
          <button
            onClick={onEdit}
            className="text-xs text-slate-400 hover:text-slate-700"
          >
            編集
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-slate-400 hover:text-red-500"
          >
            削除
          </button>
        </div>
      </div>
      {expanded && (
        <CardBody>
          <InlineEdit
            value={material.content}
            onSave={onUpdateContent}
            placeholder="内容を入力..."
            multiline
          />
          <p className="text-[10px] text-slate-400 mt-2">
            更新: {material.updatedAt.slice(0, 10)}
          </p>
        </CardBody>
      )}
      {!expanded && material.content && (
        <div
          className="px-5 py-2 cursor-pointer hover:bg-slate-50"
          onClick={() => setExpanded(true)}
        >
          <p className="text-xs text-slate-500 truncate">{material.content}</p>
        </div>
      )}
    </Card>
  )
}
