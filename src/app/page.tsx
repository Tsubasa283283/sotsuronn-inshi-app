'use client'

import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { useApp } from '@/lib/AppContext'
import { SCHOOLS, STATUS_LABELS, STATUS_COLORS, MATERIAL_TYPE_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/constants'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { Task, AppState } from '@/lib/types'
import { loadSnapshots, deleteSnapshot, saveSnapshot, getStorageUsage, type Snapshot } from '@/lib/storage'

export default function HomePage() {
  const { state, updateThesis, updateExamPrep, updateSchool, addMaterial } = useApp()
  const today = new Date().toISOString().slice(0, 10)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [storageUsage, setStorageUsage] = useState({ usedKB: 0, limitKB: 5120, pct: 0 })

  useEffect(() => {
    setSnapshots(loadSnapshots())
    setStorageUsage(getStorageUsage())
  }, [])

  const refreshSnapshots = () => setSnapshots(loadSnapshots())

  const handleManualSnapshot = () => {
    const now = new Date()
    const label = `手動保存 ${now.toLocaleDateString('ja-JP')} ${now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`
    saveSnapshot(state, label)
    refreshSnapshots()
    setImportMsg({ type: 'ok', text: 'スナップショットを保存しました' })
    setTimeout(() => setImportMsg(null), 3000)
  }

  const handleRestoreSnapshot = (snap: Snapshot) => {
    if (!confirm(`「${snap.label}」に復元しますか？\n現在のデータは上書きされます。`)) return
    updateThesis(snap.state.thesis)
    updateExamPrep(snap.state.examPrep)
    ;(['aoyama', 'meiji', 'chiba_shoka'] as const).forEach((id) => {
      updateSchool(id, snap.state.schools[id])
    })
    setImportMsg({ type: 'ok', text: `「${snap.label}」に復元しました` })
    setTimeout(() => setImportMsg(null), 4000)
  }

  const handleDeleteSnapshot = (id: string) => {
    deleteSnapshot(id)
    refreshSnapshots()
  }

  const handleExport = () => {
    const json = JSON.stringify(state, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sotsuronn-backup-${today}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as AppState
        // Restore each section via context updaters
        if (data.thesis) updateThesis(data.thesis)
        if (data.examPrep) updateExamPrep(data.examPrep)
        if (data.schools) {
          (['aoyama', 'meiji', 'chiba_shoka'] as const).forEach((id) => {
            if (data.schools[id]) updateSchool(id, data.schools[id])
          })
        }
        if (data.materials) {
          data.materials.forEach((m) => addMaterial(m))
        }
        setImportMsg({ type: 'ok', text: 'バックアップを復元しました' })
      } catch {
        setImportMsg({ type: 'err', text: 'ファイルの形式が正しくありません' })
      }
      // Reset input so same file can be re-imported
      e.target.value = ''
      setTimeout(() => setImportMsg(null), 4000)
    }
    reader.readAsText(file)
  }

  const allTasks: Task[] = [
    ...state.examPrep.tasks,
    ...state.schools.aoyama.tasks,
    ...state.schools.meiji.tasks,
    ...state.schools.chiba_shoka.tasks,
  ]

  const todayTasks = allTasks.filter(
    (t) => !t.completed && t.deadline === today
  )

  const upcomingDeadlines = allTasks
    .filter((t) => !t.completed && t.deadline && t.deadline >= today)
    .sort((a, b) => (a.deadline! > b.deadline! ? 1 : -1))
    .slice(0, 8)

  const recentMaterials = [...state.materials]
    .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
    .slice(0, 5)

  const thesisNextAction = state.thesis.nextActions.find(Boolean) ?? null
  const examNextTask = state.examPrep.tasks.find((t) => !t.completed) ?? null

  const categoryLabel = (cat: string) => {
    if (cat === 'thesis') return '卒論'
    if (cat === 'exam') return '院試'
    if (cat === 'aoyama') return '青山学院'
    if (cat === 'meiji') return '明治'
    if (cat === 'chiba_shoka') return '千葉商科'
    return cat
  }

  return (
    <div className="p-8">
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-wide">ダッシュボード</h2>
        <p className="text-xs text-slate-500 mt-0.5">{today}</p>
      </div>

      {/* Next actions */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader title="卒論 — 次のアクション" accent />
          <CardBody>
            {thesisNextAction ? (
              <div className="flex items-start gap-2">
                <span className="mt-1 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <p className="text-sm text-slate-700">{thesisNextAction}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">タスクなし</p>
            )}
            <Link
              href="/thesis"
              className="inline-block mt-3 text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2"
            >
              卒論ページへ →
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="院試対策 — 次のアクション" accent />
          <CardBody>
            {examNextTask ? (
              <div className="flex items-start gap-2">
                <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                <p className="text-sm text-slate-700">{examNextTask.title}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">タスクなし</p>
            )}
            <Link
              href="/exam"
              className="inline-block mt-3 text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2"
            >
              院試対策ページへ →
            </Link>
          </CardBody>
        </Card>
      </div>

      {/* Today tasks */}
      {todayTasks.length > 0 && (
        <Card className="mb-5">
          <CardHeader title="本日のタスク" subtitle={`${todayTasks.length}件`} accent />
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {todayTasks.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-2.5 text-slate-700">{t.title}</td>
                    <td className="px-3 py-2.5">
                      <Badge className={PRIORITY_COLORS[t.priority]}>
                        {PRIORITY_LABELS[t.priority]}
                      </Badge>
                    </td>
                    <td className="px-5 py-2.5 text-xs text-slate-400">
                      {categoryLabel(t.category)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-5">
        {/* Deadlines */}
        <div className="col-span-2">
          <Card>
            <CardHeader title="締切一覧" subtitle="直近の期限付きタスク" accent />
            <CardBody className="p-0">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-slate-400 italic p-5">期限設定済みのタスクなし</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500 tracking-wide">期限</th>
                      <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500 tracking-wide">タスク</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 tracking-wide">区分</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 tracking-wide">優先</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingDeadlines.map((t) => {
                      const isToday = t.deadline === today
                      return (
                        <tr key={t.id} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 ${isToday ? 'bg-amber-50' : ''}`}>
                          <td className={`px-5 py-2.5 text-xs whitespace-nowrap font-medium ${isToday ? 'text-amber-700' : 'text-slate-500'}`}>
                            {t.deadline}{isToday ? ' (今日)' : ''}
                          </td>
                          <td className="px-5 py-2.5 text-slate-700">{t.title}</td>
                          <td className="px-3 py-2.5 text-xs text-slate-500">{categoryLabel(t.category)}</td>
                          <td className="px-3 py-2.5">
                            <Badge className={PRIORITY_COLORS[t.priority]}>
                              {PRIORITY_LABELS[t.priority]}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>
        </div>

        <div>
          {/* School progress */}
          <Card className="mb-5">
            <CardHeader title="志望校の進捗" accent />
            <CardBody className="p-0">
              {Object.values(SCHOOLS).map((school) => {
                const data = state.schools[school.id]
                const href = `/schools/${school.id.replace('_', '-')}`
                return (
                  <Link
                    key={school.id}
                    href={href}
                    className="flex items-center justify-between px-5 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm text-slate-700">{school.shortName}</span>
                    <Badge className={STATUS_COLORS[data.status]}>
                      {STATUS_LABELS[data.status]}
                    </Badge>
                  </Link>
                )
              })}
            </CardBody>
          </Card>

          {/* Recent materials */}
          <Card>
            <CardHeader title="最近の共通素材" accent />
            <CardBody className="p-0">
              {recentMaterials.length === 0 ? (
                <p className="text-sm text-slate-400 italic p-5">素材なし</p>
              ) : (
                recentMaterials.map((m) => (
                  <Link
                    key={m.id}
                    href="/materials"
                    className="block px-5 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-sm text-slate-700 truncate">{m.title}</p>
                    <Badge className="mt-1 bg-slate-100 text-slate-500">
                      {MATERIAL_TYPE_LABELS[m.type]}
                    </Badge>
                  </Link>
                ))
              )}
              <div className="px-5 py-2.5 border-t border-slate-100">
                <Link href="/materials" className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2">
                  すべて見る →
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Backup */}
      <Card className="mt-5">
        <CardHeader title="バックアップ" subtitle="3重保護：ミラー保存 ＋ スナップショット ＋ JSONエクスポート" accent />
        <CardBody>
          {/* Status */}
          <div className="mb-5 p-3 bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                ミラー保存：変更のたびに自動で2か所に書き込み
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                スナップショット：直近{snapshots.length}件を保持
              </span>
            </div>
            {/* Storage usage bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">ストレージ使用量</span>
                <span className={`font-medium ${storageUsage.pct > 80 ? 'text-red-600' : storageUsage.pct > 50 ? 'text-amber-600' : 'text-slate-600'}`}>
                  {storageUsage.usedKB.toFixed(1)} KB / {storageUsage.limitKB} KB（{storageUsage.pct.toFixed(1)}%）
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5">
                <div
                  className={`h-1.5 transition-all ${storageUsage.pct > 80 ? 'bg-red-500' : storageUsage.pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(storageUsage.pct, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <button
              onClick={handleManualSnapshot}
              className="px-4 py-2 bg-amber-600 text-white text-sm hover:bg-amber-700 transition-colors"
            >
              今すぐスナップショット
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-slate-800 text-white text-sm hover:bg-slate-700 transition-colors"
            >
              JSONでエクスポート
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm hover:bg-slate-50 transition-colors"
            >
              JSONからインポート
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            {importMsg && (
              <span className={`text-xs font-medium ${importMsg.type === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>
                {importMsg.text}
              </span>
            )}
          </div>

          {/* Snapshot list */}
          <div>
            <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase mb-2">
              自動スナップショット履歴（最大10件）
            </p>
            {snapshots.length === 0 ? (
              <p className="text-xs text-slate-400 italic">まだスナップショットがありません（データを入力すると次回起動時に自動保存されます）</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">保存日時</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">ラベル</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map((snap) => (
                    <tr key={snap.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 group">
                      <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(snap.timestamp).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-700">{snap.label}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleRestoreSnapshot(snap)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            復元
                          </button>
                          <button
                            onClick={() => handleDeleteSnapshot(snap.id)}
                            className="text-xs text-slate-400 hover:text-red-500"
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
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
