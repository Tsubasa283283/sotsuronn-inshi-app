'use client'

import { Card, CardHeader, CardBody } from '@/components/ui/Card'

const LINK_GROUPS = [
  {
    title: '論文・学術データベース',
    links: [
      {
        name: 'CiNii Research',
        url: 'https://cir.nii.ac.jp/',
        description: '国内の論文・図書・研究データを横断検索',
        tag: '日本語論文',
        tagColor: 'bg-blue-100 text-blue-700',
      },
      {
        name: 'Google Scholar',
        url: 'https://scholar.google.com/',
        description: '学術論文・引用情報を幅広く検索',
        tag: '総合',
        tagColor: 'bg-slate-100 text-slate-600',
      },
      {
        name: 'J-STAGE',
        url: 'https://www.jstage.jst.go.jp/',
        description: '科学技術・医療分野の日本語論文を無料公開',
        tag: '日本語論文',
        tagColor: 'bg-blue-100 text-blue-700',
      },
      {
        name: '国立国会図書館デジタルコレクション',
        url: 'https://dl.ndl.go.jp/',
        description: '図書・雑誌・古文書など幅広い資料をデジタル閲覧',
        tag: '図書・資料',
        tagColor: 'bg-amber-100 text-amber-700',
      },
      {
        name: 'IRDB（機関リポジトリ）',
        url: 'https://irdb.nii.ac.jp/',
        description: '大学・研究機関が公開する学術成果物を横断検索',
        tag: '日本語論文',
        tagColor: 'bg-blue-100 text-blue-700',
      },
    ],
  },
  {
    title: '法律・税務・行政',
    links: [
      {
        name: '国税庁',
        url: 'https://www.nta.go.jp/',
        description: '税法・通達・統計資料など税務関連の公式情報',
        tag: '税務',
        tagColor: 'bg-emerald-100 text-emerald-700',
      },
      {
        name: 'e-Gov 法令検索',
        url: 'https://laws.e-gov.go.jp/',
        description: '日本の現行法令を全文検索・閲覧',
        tag: '法律',
        tagColor: 'bg-purple-100 text-purple-700',
      },
      {
        name: '総務省統計局',
        url: 'https://www.stat.go.jp/',
        description: '国勢調査・経済センサスなど各種統計データ',
        tag: '統計',
        tagColor: 'bg-rose-100 text-rose-700',
      },
      {
        name: '財務省',
        url: 'https://www.mof.go.jp/',
        description: '予算・財政・税制改正の資料・白書',
        tag: '財政',
        tagColor: 'bg-emerald-100 text-emerald-700',
      },
    ],
  },
  {
    title: '大学院・研究計画書',
    links: [
      {
        name: '青山学院大学大学院',
        url: 'https://www.aoyama.ac.jp/graduate/',
        description: '入試情報・研究科紹介',
        tag: '志望校',
        tagColor: 'bg-indigo-100 text-indigo-700',
      },
      {
        name: '明治大学大学院',
        url: 'https://www.meiji.ac.jp/macs/',
        description: '入試情報・研究科紹介',
        tag: '志望校',
        tagColor: 'bg-indigo-100 text-indigo-700',
      },
      {
        name: '千葉商科大学大学院',
        url: 'https://www.cuc.ac.jp/graduate/',
        description: '入試情報・研究科紹介',
        tag: '志望校',
        tagColor: 'bg-indigo-100 text-indigo-700',
      },
    ],
  },
]

export default function LinksPage() {
  return (
    <div className="p-8">
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-wide">参考リンク集</h2>
        <p className="text-xs text-slate-500 mt-0.5">論文検索・法令・統計など研究に役立つサイト一覧</p>
      </div>

      <div className="space-y-6">
        {LINK_GROUPS.map((group) => (
          <Card key={group.title}>
            <CardHeader title={group.title} accent />
            <CardBody className="p-0">
              {group.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 group-hover:text-amber-700 transition-colors">
                      {link.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{link.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${link.tagColor}`}>
                    {link.tag}
                  </span>
                  <span className="text-slate-300 text-xs flex-shrink-0 group-hover:text-amber-500 transition-colors">↗</span>
                </a>
              ))}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
