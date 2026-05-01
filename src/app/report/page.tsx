'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/lib/AppContext'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import type { Reference } from '@/lib/types'

function refCitation(r: Reference): string {
  const author = r.author || ''
  const title = r.title || ''
  const journal = r.journal || ''
  const year = r.year ? String(r.year) : ''

  let cite = ''
  if (author) cite += `${author}「${title}」`
  else cite += `「${title}」`
  if (journal) cite += `『${journal}』`
  if (year) cite += year
  return cite
}

function val(v: string | undefined): string {
  return v?.trim() || '未記入'
}

function generateMarkdown(
  refs: Reference[],
  synthesis: string,
  ownRQ: string,
  nextTasks: string,
  questions: string,
): string {
  if (refs.length === 0) {
    return '# ゼミ進捗報告\n\n（「今週の報告に含める」にチェックされた文献がありません）\n'
  }

  const lines: string[] = []

  lines.push('# ゼミ進捗報告')
  lines.push('')

  // 1. 今週集めた先行研究
  lines.push('## 1. 今週集めた先行研究')
  lines.push('')
  for (const r of refs) {
    lines.push(`- ${refCitation(r)}`)
  }
  lines.push('')

  // 2. RQ & Answer
  lines.push('## 2. 各先行研究のResearch QuestionとAnswer')
  for (const r of refs) {
    lines.push('')
    lines.push(`### ${refCitation(r)}`)
    lines.push('')
    lines.push(`**Research Question：**  `)
    lines.push(val(r.researchQuestion))
    lines.push('')
    lines.push(`**Answer：**  `)
    lines.push(val(r.answer))
  }
  lines.push('')

  // 3. 自分の研究への活用
  lines.push('## 3. 自分の研究への活用')
  for (const r of refs) {
    lines.push('')
    lines.push(`### ${refCitation(r)}`)
    lines.push('')
    lines.push(val(r.utilization))
  }
  lines.push('')

  // 4-7 自由記述
  lines.push('## 4. 先行研究群の整理')
  lines.push('')
  lines.push(synthesis.trim() || '未記入')
  lines.push('')

  lines.push('## 5. 現時点の自分のResearch Question')
  lines.push('')
  lines.push(ownRQ.trim() || '未記入')
  lines.push('')

  lines.push('## 6. 次回までにやること')
  lines.push('')
  lines.push(nextTasks.trim() || '未記入')
  lines.push('')

  lines.push('## 7. 先生に聞きたいこと')
  lines.push('')
  lines.push(questions.trim() || '未記入')
  lines.push('')

  return lines.join('\n')
}

export default function ReportPage() {
  const { state, updateThesis } = useApp()
  const { thesis } = state

  const draft = thesis.reportDraft ?? { synthesis: '', ownRQ: '', nextTasks: '', questions: '' }

  const [synthesis, setSynthesis] = useState(draft.synthesis)
  const [ownRQ, setOwnRQ] = useState(draft.ownRQ)
  const [nextTasks, setNextTasks] = useState(draft.nextTasks)
  const [questions, setQuestions] = useState(draft.questions)
  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)

  const targetRefs = thesis.references.filter((r) => r.includeInReport)

  const markdown = useMemo(
    () => generateMarkdown(targetRefs, synthesis, ownRQ, nextTasks, questions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [generated]
  )

  const saveDraft = () => {
    updateThesis({ reportDraft: { synthesis, ownRQ, nextTasks, questions } })
  }

  const handleGenerate = () => {
    saveDraft()
    setGenerated(true)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const date = new Date().toISOString().slice(0, 10)
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `zemi-report-${date}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const ta = 'w-full border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-amber-400 resize-none'

  return (
    <div className="p-8">
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-wide">ゼミ進捗報告 生成</h2>
        <p className="text-xs text-slate-500 mt-0.5">チェックした文献をもとにMarkdownを自動生成します</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Left: 対象文献 & 自由入力 */}
        <div className="space-y-5">

          {/* 対象文献 */}
          <Card>
            <CardHeader
              title="今週の報告に含める文献"
              subtitle={`${targetRefs.length}件`}
              accent
            />
            <CardBody className="p-0">
              {targetRefs.length === 0 ? (
                <p className="text-sm text-slate-400 italic p-5">
                  「卒論」ページの文献一覧で「報告」列のチェックボックスにチェックを入れてください
                </p>
              ) : (
                targetRefs.map((r, i) => (
                  <div key={r.id} className="px-5 py-3 border-b border-slate-100 last:border-0">
                    <p className="text-xs font-medium text-slate-700">{i + 1}. {refCitation(r)}</p>
                    {r.researchQuestion && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">RQ: {r.researchQuestion}</p>
                    )}
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          {/* 自由記述セクション */}
          <Card>
            <CardHeader title="4. 先行研究群の整理" accent />
            <CardBody>
              <textarea
                value={synthesis}
                onChange={(e) => setSynthesis(e.target.value)}
                rows={4}
                placeholder="先行研究全体を俯瞰して整理・比較..."
                className={ta}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="5. 現時点の自分のResearch Question" accent />
            <CardBody>
              <textarea
                value={ownRQ}
                onChange={(e) => setOwnRQ(e.target.value)}
                rows={3}
                placeholder="現在の自分のRQを記述..."
                className={ta}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="6. 次回までにやること" accent />
            <CardBody>
              <textarea
                value={nextTasks}
                onChange={(e) => setNextTasks(e.target.value)}
                rows={3}
                placeholder="次回ゼミまでにやること..."
                className={ta}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="7. 先生に聞きたいこと" accent />
            <CardBody>
              <textarea
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                rows={3}
                placeholder="先生への質問・相談事項..."
                className={ta}
              />
            </CardBody>
          </Card>

          <button
            onClick={handleGenerate}
            className="w-full py-2.5 bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors"
          >
            Markdownを生成
          </button>
        </div>

        {/* Right: 生成結果 */}
        <div>
          <Card>
            <CardHeader
              title="生成されたMarkdown"
              accent
              action={
                generated ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1 bg-slate-600 text-white text-xs hover:bg-slate-500 transition-colors"
                    >
                      {copied ? '✓ コピー済み' : 'コピー'}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-2.5 py-1 bg-slate-800 text-white text-xs hover:bg-slate-700 transition-colors"
                    >
                      ダウンロード
                    </button>
                  </div>
                ) : undefined
              }
            />
            <CardBody>
              {!generated ? (
                <p className="text-sm text-slate-400 italic">
                  左の内容を入力して「Markdownを生成」を押してください
                </p>
              ) : (
                <textarea
                  readOnly
                  value={markdown}
                  rows={40}
                  className="w-full font-mono text-xs text-slate-700 border border-slate-200 px-3 py-2 focus:outline-none bg-slate-50 resize-none"
                />
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
