'use client'

import { useState, useCallback } from 'react'
import { useApp } from '@/lib/AppContext'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import type { ResearchPlan } from '@/lib/types'

const FIELDS: { key: keyof ResearchPlan; label: string; section: string; rows: number; isInput?: boolean }[] = [
  { key: 'provisionalTitle', label: '仮タイトル', section: '仮タイトル', rows: 1, isInput: true },
  { key: 'background', label: '1. 研究背景', section: '1. 研究背景', rows: 5 },
  { key: 'problemAwareness', label: '2. 問題意識', section: '2. 問題意識', rows: 4 },
  { key: 'literatureReview', label: '3. 先行研究の整理', section: '3. 先行研究の整理', rows: 5 },
  { key: 'researchGap', label: '4. 研究ギャップ', section: '4. 研究ギャップ', rows: 4 },
  { key: 'researchQuestion', label: '5. Research Question', section: '5. Research Question', rows: 3 },
  { key: 'purpose', label: '6. 研究目的', section: '6. 研究目的', rows: 3 },
  { key: 'methodology', label: '7. 研究方法', section: '7. 研究方法', rows: 4 },
  { key: 'expectedConclusion', label: '8. 期待される結論', section: '8. 期待される結論', rows: 4 },
  { key: 'references', label: '9. 参考文献', section: '9. 参考文献', rows: 4 },
  { key: 'schoolAdjustment', label: '10. 志望校に合わせた調整メモ', section: '10. 志望校に合わせた調整メモ', rows: 4 },
]

const EXAMPLES: ResearchPlan = {
  provisionalTitle: '消費税増税が中小企業の経営行動に与える影響――財務データの実証分析――',
  background: '日本では2019年に消費税率が10%に引き上げられ、中小企業の経営環境は大きく変化した。特に、消費税の転嫁が困難な業種では売上・利益率への打撃が深刻であり、倒産件数や雇用削減との相関が指摘されている。',
  problemAwareness: '消費税増税の影響は大企業と中小企業で非対称に現れると考えられるが、中小企業に特化した財務指標への影響を定量的に分析した研究は少ない。また、業種別・規模別の差異についても十分に検討されていない。',
  literatureReview: '田中（2020）は増税後の中小企業の売上高変動を記述統計で分析したが、因果推論の手法は用いていない。鈴木・山田（2021）は大企業を対象にした差分の差分法による分析を行ったが、中小企業への適用はなされていない。',
  researchGap: '既存研究では中小企業の財務データを用いた因果推論的アプローチが不足している。特に、増税前後のパネルデータを活用した差分の差分法による分析は行われておらず、業種間比較も不十分である。',
  researchQuestion: '消費税率の10%への引き上げは、中小企業の売上高・営業利益率・雇用者数にどのような影響を与えたか。また、その影響は業種によって異なるか。',
  purpose: '本研究は、消費税増税が中小企業の経営指標（売上高・営業利益率・雇用者数）に与えた影響を、差分の差分法を用いて実証的に明らかにすることを目的とする。',
  methodology: '中小企業庁の財務データベースおよび帝国データバンクの財務データを使用し、2017〜2021年のパネルデータを構築する。増税前後を処置期間とし、消費税の影響を受けやすい業種（飲食・小売）と影響が相対的に小さい業種（製造・IT）を比較群として差分の差分法を適用する。',
  expectedConclusion: '消費税増税は飲食・小売業の中小企業において売上高・営業利益率を有意に低下させる一方、製造・IT業種では影響が限定的であることが示されると予想する。これにより、業種に応じた税制上の支援策の必要性を示すことができる。',
  references: '田中一郎「消費税増税と中小企業の売上変動」『中小企業研究』2020年\n鈴木太郎・山田花子「差分の差分法による消費税転嫁の分析」『財政学研究』2021年\n国税庁「消費税の転嫁状況に関する調査」2020年',
  schoolAdjustment: '【青山学院】会計・法律の融合分野として「消費税法の実態との乖離」に言及する。教授の専門（租税法）と接続できるよう税制政策の視点を強調する。\n【明治】経営学的視点から「中小企業の経営戦略への影響」を前面に出す。\n【千葉商科】商科系の実学志向に合わせ、「政策提言」の節を加える。',
}

function generateMarkdown(plan: ResearchPlan): string {
  const v = (s: string) => s.trim() || '未記入'
  const lines: string[] = []

  lines.push(`## 仮タイトル`)
  lines.push('')
  lines.push(v(plan.provisionalTitle))
  lines.push('')

  const sections: [keyof ResearchPlan, string][] = [
    ['background', '1. 研究背景'],
    ['problemAwareness', '2. 問題意識'],
    ['literatureReview', '3. 先行研究の整理'],
    ['researchGap', '4. 研究ギャップ'],
    ['researchQuestion', '5. Research Question'],
    ['purpose', '6. 研究目的'],
    ['methodology', '7. 研究方法'],
    ['expectedConclusion', '8. 期待される結論'],
    ['references', '9. 参考文献'],
    ['schoolAdjustment', '10. 志望校に合わせた調整メモ'],
  ]

  for (const [key, heading] of sections) {
    lines.push(`## ${heading}`)
    lines.push('')
    lines.push(v(plan[key]))
    lines.push('')
  }

  return lines.join('\n')
}

const taBase = 'w-full border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-amber-400 resize-none'
const inputBase = 'w-full border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-amber-400'

export default function PlanPage() {
  const { state, updateResearchPlan } = useApp()
  const plan = state.researchPlan

  const [local, setLocal] = useState<ResearchPlan>({ ...plan })
  const [generated, setGenerated] = useState(false)
  const [markdown, setMarkdown] = useState('')
  const [copied, setCopied] = useState(false)

  const set = useCallback((key: keyof ResearchPlan, value: string) => {
    setLocal((prev) => {
      const next = { ...prev, [key]: value }
      updateResearchPlan({ [key]: value })
      return next
    })
  }, [updateResearchPlan])

  const handleInsertExample = () => {
    const next = { ...local }
    for (const key of Object.keys(EXAMPLES) as (keyof ResearchPlan)[]) {
      if (!local[key].trim()) {
        next[key] = EXAMPLES[key]
      }
    }
    setLocal(next)
    updateResearchPlan(next)
  }

  const handleClear = () => {
    if (!confirm('研究計画書ビルダーの入力内容をすべて消去します。よろしいですか？')) return
    const empty: ResearchPlan = {
      provisionalTitle: '', background: '', problemAwareness: '', literatureReview: '',
      researchGap: '', researchQuestion: '', purpose: '', methodology: '',
      expectedConclusion: '', references: '', schoolAdjustment: '',
    }
    setLocal(empty)
    updateResearchPlan(empty)
    setGenerated(false)
  }

  const handleGenerate = () => {
    setMarkdown(generateMarkdown(local))
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
    a.download = `research-plan-${date}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-8">
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-wide">研究計画書ビルダー</h2>
        <p className="text-xs text-slate-500 mt-0.5">各項目を入力してMarkdown形式の研究計画書を生成します</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Left: 入力フォーム */}
        <div className="space-y-4">
          {/* ツールバー */}
          <div className="flex gap-2">
            <button
              onClick={handleInsertExample}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors border border-slate-200"
            >
              入力例を挿入
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors border border-red-200"
            >
              全消去
            </button>
          </div>

          {/* 仮タイトル */}
          <Card>
            <CardHeader title="仮タイトル" accent />
            <CardBody>
              <input
                type="text"
                value={local.provisionalTitle}
                onChange={(e) => set('provisionalTitle', e.target.value)}
                placeholder="研究の仮タイトルを入力..."
                className={inputBase}
              />
              <p className="text-right text-[10px] text-slate-400 mt-1">{local.provisionalTitle.length}文字</p>
            </CardBody>
          </Card>

          {/* その他フィールド */}
          {FIELDS.filter((f) => !f.isInput).map((f) => (
            <Card key={f.key}>
              <CardHeader title={f.section} accent />
              <CardBody>
                <textarea
                  value={local[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  rows={f.rows}
                  placeholder={`${f.label}を入力...`}
                  className={taBase}
                />
                <p className="text-right text-[10px] text-slate-400 mt-1">{local[f.key].length}文字</p>
              </CardBody>
            </Card>
          ))}

          <button
            onClick={handleGenerate}
            className="w-full py-2.5 bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors"
          >
            研究計画書として出力
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
                  左の内容を入力して「研究計画書として出力」を押してください
                </p>
              ) : (
                <textarea
                  readOnly
                  value={markdown}
                  rows={50}
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
