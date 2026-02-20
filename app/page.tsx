'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import type { AIAgentResponse } from '@/lib/aiAgent'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Switch } from '@/components/ui/switch'
import {
  FiCopy, FiCheck, FiChevronDown, FiChevronRight, FiSearch,
  FiTrash2, FiMenu, FiX, FiEdit3, FiClock, FiBookOpen,
  FiFileText, FiSend, FiRefreshCw, FiZap, FiSettings, FiChevronLeft, FiAlertCircle
} from 'react-icons/fi'

// ============================================================
// CONSTANTS
// ============================================================

const CONTENT_ORCHESTRATOR_ID = '6998e65de1522e8a48d1d296'
const NOTES_CREATOR_ID = '6998e66b6b8b4ea65c49291e'

const THEME_VARS = {
  '--background': '0 0% 98%',
  '--foreground': '0 0% 8%',
  '--card': '0 0% 100%',
  '--card-foreground': '0 0% 8%',
  '--primary': '0 0% 8%',
  '--primary-foreground': '0 0% 98%',
  '--secondary': '0 0% 94%',
  '--secondary-foreground': '0 0% 8%',
  '--accent': '0 80% 45%',
  '--accent-foreground': '0 0% 98%',
  '--muted': '0 0% 92%',
  '--muted-foreground': '0 0% 40%',
  '--border': '0 0% 85%',
  '--ring': '0 0% 8%',
  '--radius': '0rem',
  '--destructive': '0 80% 45%',
  '--destructive-foreground': '0 0% 98%',
  '--input': '0 0% 85%',
  '--popover': '0 0% 100%',
  '--popover-foreground': '0 0% 8%',
} as React.CSSProperties

// ============================================================
// TYPES
// ============================================================

interface ArticleSection {
  heading: string
  content: string
}

interface ArticleData {
  title: string
  subtitle: string
  meta_description: string
  article_body: string
  sections: ArticleSection[]
  seo_keywords: string[]
  sources: string[]
  topic_suggestions: string[]
}

interface NoteData {
  content: string
  character_count: number
  hook_type: string
}

interface HistoryEntry {
  id: string
  title: string
  subtitle: string
  date: string
  article: ArticleData
  notes: NoteData[]
}

// ============================================================
// SAMPLE DATA
// ============================================================

const SAMPLE_ARTICLE: ArticleData = {
  title: 'The Hidden Economics of Attention: Why Your Focus Is the New Currency',
  subtitle: 'How the attention economy reshapes productivity, creativity, and the way we build careers in 2025',
  meta_description: 'Explore how the attention economy affects productivity, creativity, and career growth. Learn strategies to reclaim your focus in an age of constant distraction.',
  article_body: 'In an era where every notification competes for your awareness, understanding the economics of attention has never been more critical...',
  sections: [
    {
      heading: 'The Attention Deficit',
      content: 'The average knowledge worker checks email 74 times per day and switches tasks every 3 minutes. This constant context-switching costs the global economy an estimated $450 billion annually in lost productivity. But the real cost is not just economic -- it is deeply personal.\n\nWhen we fragment our attention, we lose the capacity for deep work, the kind of sustained focus that produces breakthrough ideas, meaningful writing, and genuine innovation.'
    },
    {
      heading: 'From Information Economy to Attention Economy',
      content: 'Herbert Simon first noted in 1971 that "a wealth of information creates a poverty of attention." Five decades later, his observation has become the defining challenge of our era.\n\nThe shift from an information economy to an attention economy fundamentally changes the rules of value creation. In the old paradigm, those who could access and process information held power. In the new paradigm, those who can sustain and direct attention are the ones who thrive.'
    },
    {
      heading: 'Reclaiming Your Focus: A Practical Framework',
      content: '**1. Audit your attention budget.** Track how you spend your attention for one week. You will be surprised where it goes.\n\n**2. Create attention rituals.** Designate specific times for deep work, and protect them fiercely.\n\n**3. Design your environment.** Remove friction from focus and add friction to distraction.\n\n**4. Practice deliberate recovery.** Rest is not the absence of work -- it is the active restoration of attention capacity.'
    },
    {
      heading: 'The Future of Attention',
      content: 'As AI handles more routine cognitive tasks, the premium on human attention will only increase. The ability to focus deeply, think creatively, and engage meaningfully will become the ultimate competitive advantage.\n\nThe question is not whether you can afford to invest in your attention. It is whether you can afford not to.'
    }
  ],
  seo_keywords: ['attention economy', 'deep work', 'productivity', 'focus strategies', 'knowledge worker', 'digital distraction', 'career growth'],
  sources: [
    'Herbert Simon, "Designing Organizations for an Information-Rich World" (1971)',
    'Cal Newport, "Deep Work: Rules for Focused Success in a Distracted World" (2016)',
    'Gloria Mark, "Attention Span: A Groundbreaking Way to Restore Balance" (2023)',
    'McKinsey Global Institute, "The Social Economy" Report (2024)'
  ],
  topic_suggestions: []
}

const SAMPLE_NOTES: NoteData[] = [
  {
    content: 'I tracked my attention for 7 days straight last March.\n\nThe results gutted me: 73 email checks per day. 147 app switches. 11 minutes was my longest unbroken focus block.\n\nI was a productivity writer who could not focus for 12 minutes.\n\nThat spreadsheet became the outline for everything I write about attention now. The data that embarrassed me turned into the thesis that changed my career.',
    character_count: 374,
    hook_type: 'confession'
  },
  {
    content: 'Everyone says "just turn off notifications." I did that for 6 months. My deep work time increased by exactly 4 minutes per day.\n\nThe real lever was redesigning my physical environment -- moving my phone charger to another room added 47 minutes of focus daily.\n\nThe $450 billion attention crisis is not a software problem. It is an architecture problem.',
    character_count: 351,
    hook_type: 'comparison_flip'
  },
  {
    content: '3:47 AM, a Tuesday in November. I was rewriting the same paragraph for the ninth time.\n\nHerbert Simon wrote about this exact moment in 1971 -- the paradox of drowning in information while starving for attention. Fifty-three years later, I was living proof.\n\nI closed every tab. Opened a blank document. Wrote 2,200 words in 94 minutes.\n\nThe article that came from that night has been read 31,000 times. The secret was not discipline. It was desperation.',
    character_count: 448,
    hook_type: 'moment_story'
  },
  {
    content: 'Context-switching costs the global economy $450 billion annually. That number comes from a McKinsey study most people cite but few actually read.\n\nThe buried finding: 68% of that cost hits individual creators and knowledge workers, not corporations. The attention tax falls hardest on the people least able to afford it.',
    character_count: 318,
    hook_type: 'data_truth'
  }
]

const SAMPLE_SUGGESTIONS = [
  'The Psychology of Pricing: Why We Pay More for Less',
  'Remote Work 3.0: The Hybrid Model Is Already Dead',
  'Why the Best Founders Are Terrible at Multitasking',
  'The Loneliness Epidemic Among Digital Creators',
  'From Side Hustle to Exit: 5 Lessons Nobody Talks About'
]

// ============================================================
// MARKDOWN RENDERER
// ============================================================

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">{part}</strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  )
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return <h4 key={i} className="font-semibold text-sm mt-3 mb-1 font-serif">{line.slice(4)}</h4>
        if (line.startsWith('## '))
          return <h3 key={i} className="font-semibold text-base mt-3 mb-1 font-serif">{line.slice(3)}</h3>
        if (line.startsWith('# '))
          return <h2 key={i} className="font-bold text-lg mt-4 mb-2 font-serif">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <li key={i} className="ml-4 list-disc text-sm leading-7">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line))
          return <li key={i} className="ml-4 list-decimal text-sm leading-7">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-2" />
        return <p key={i} className="text-sm leading-7">{formatInline(line)}</p>
      })}
    </div>
  )
}

// ============================================================
// ERROR BOUNDARY
// ============================================================

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-none text-sm">
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ============================================================
// HELPER: COPY TO CLIPBOARD
// ============================================================

function useCopyAction() {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copyText = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopiedId(id)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopiedId(null), 2000)
    }
  }, [])

  return { copiedId, copyText }
}

// ============================================================
// HISTORY SIDEBAR
// ============================================================

function HistorySidebar({
  open,
  onClose,
  history,
  onSelect,
  onDelete,
  searchQuery,
  onSearchChange,
}: {
  open: boolean
  onClose: () => void
  history: HistoryEntry[]
  onSelect: (entry: HistoryEntry) => void
  onDelete: (id: string) => void
  searchQuery: string
  onSearchChange: (v: string) => void
}) {
  const filtered = history.filter(entry => {
    const q = searchQuery.toLowerCase()
    return (entry.title?.toLowerCase() ?? '').includes(q) ||
           (entry.subtitle?.toLowerCase() ?? '').includes(q)
  })

  return (
    <div className={cn(
      'fixed inset-y-0 left-0 z-50 w-80 border-r border-border bg-card transition-transform duration-300',
      open ? 'translate-x-0' : '-translate-x-full'
    )}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-serif text-lg font-bold tracking-tight">History</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-none">
          <FiX className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 rounded-none"
          />
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="p-4 pt-0 space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {history.length === 0 ? 'No articles yet' : 'No matching articles'}
            </p>
          )}
          {filtered.map((entry) => (
            <Card key={entry.id} className="rounded-none shadow-none border border-border cursor-pointer hover:bg-secondary/50 transition-colors">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => onSelect(entry)}
                    className="text-left flex-1 min-w-0"
                  >
                    <p className="font-serif font-semibold text-sm tracking-tight truncate">
                      {entry.title || 'Untitled'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {entry.subtitle || 'No subtitle'}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <FiClock className="h-3 w-3" />
                      <span>{entry.date}</span>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }}
                    className="rounded-none h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <FiTrash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

// ============================================================
// ARTICLE SKELETON LOADER
// ============================================================

function ArticleSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-10 w-3/4 rounded-none" />
      <Skeleton className="h-6 w-1/2 rounded-none" />
      <Skeleton className="h-4 w-full rounded-none" />
      <Separator />
      <div className="space-y-4">
        <Skeleton className="h-7 w-1/3 rounded-none" />
        <Skeleton className="h-4 w-full rounded-none" />
        <Skeleton className="h-4 w-full rounded-none" />
        <Skeleton className="h-4 w-5/6 rounded-none" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-7 w-2/5 rounded-none" />
        <Skeleton className="h-4 w-full rounded-none" />
        <Skeleton className="h-4 w-full rounded-none" />
        <Skeleton className="h-4 w-4/5 rounded-none" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-7 w-1/4 rounded-none" />
        <Skeleton className="h-4 w-full rounded-none" />
        <Skeleton className="h-4 w-full rounded-none" />
        <Skeleton className="h-4 w-3/4 rounded-none" />
      </div>
      <Separator />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-none" />
        <Skeleton className="h-6 w-24 rounded-none" />
        <Skeleton className="h-6 w-16 rounded-none" />
      </div>
    </div>
  )
}

// ============================================================
// NOTES SKELETON LOADER
// ============================================================

function NotesSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <Card key={i} className="rounded-none shadow-none border border-border">
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-full rounded-none" />
            <Skeleton className="h-4 w-5/6 rounded-none" />
            <Skeleton className="h-4 w-3/4 rounded-none" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-16 rounded-none" />
              <Skeleton className="h-5 w-20 rounded-none" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============================================================
// AGENT STATUS DISPLAY
// ============================================================

function AgentStatusPanel({ activeAgentId }: { activeAgentId: string | null }) {
  const agents = [
    { id: CONTENT_ORCHESTRATOR_ID, name: 'Content Orchestrator', role: 'Coordinates article generation (manages Research, Drafting, SEO sub-agents)' },
    { id: NOTES_CREATOR_ID, name: 'Notes Creator', role: 'Generates promotional Substack Notes from articles' },
  ]

  return (
    <Card className="rounded-none shadow-none border border-border">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-sans uppercase tracking-widest text-muted-foreground">Agent Status</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        {agents.map(agent => (
          <div key={agent.id} className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full shrink-0',
              activeAgentId === agent.id ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'
            )} />
            <div className="min-w-0">
              <p className={cn(
                'text-xs font-medium truncate',
                activeAgentId === agent.id ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {agent.name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{agent.role}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ============================================================
// NOTE CARD
// ============================================================

function NoteCard({
  note,
  index,
  copiedId,
  onCopy,
}: {
  note: NoteData
  index: number
  copiedId: string | null
  onCopy: (text: string, id: string) => void
}) {
  const noteId = `note-${index}`
  return (
    <Card className="rounded-none shadow-none border border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-sm leading-7 whitespace-pre-wrap">{note.content ?? ''}</div>
            <div className="flex items-center gap-2 mt-3">
              {note.hook_type && (
                <Badge variant="outline" className="rounded-none text-[10px] uppercase tracking-wider font-medium">
                  {note.hook_type}
                </Badge>
              )}
              {(note.character_count ?? 0) > 0 && (
                <Badge variant="secondary" className="rounded-none text-[10px]">
                  {note.character_count} chars
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-none shrink-0 h-8 w-8"
            onClick={() => onCopy(note.content ?? '', noteId)}
          >
            {copiedId === noteId ? <FiCheck className="h-4 w-4 text-green-600" /> : <FiCopy className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function Page() {
  // --- State ---
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('Informative')
  const [audience, setAudience] = useState('General')
  const [length, setLength] = useState('Standard (~1500 words)')
  const [configOpen, setConfigOpen] = useState(true)

  const [article, setArticle] = useState<ArticleData | null>(null)
  const [notes, setNotes] = useState<NoteData[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])

  const [loadingArticle, setLoadingArticle] = useState(false)
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [loadingIdeas, setLoadingIdeas] = useState(false)

  const [articleError, setArticleError] = useState<string | null>(null)
  const [notesError, setNotesError] = useState<string | null>(null)
  const [ideasError, setIdeasError] = useState<string | null>(null)

  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const [sampleMode, setSampleMode] = useState(false)

  const { copiedId, copyText } = useCopyAction()

  // Editable fields
  const [editTitle, setEditTitle] = useState('')
  const [editSubtitle, setEditSubtitle] = useState('')
  const [editSections, setEditSections] = useState<ArticleSection[]>([])

  // --- Load history from localStorage ---
  useEffect(() => {
    try {
      const stored = localStorage.getItem('substack_studio_history')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setHistory(parsed)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // --- Save history to localStorage ---
  const saveHistory = useCallback((entries: HistoryEntry[]) => {
    setHistory(entries)
    try {
      localStorage.setItem('substack_studio_history', JSON.stringify(entries))
    } catch {
      // ignore
    }
  }, [])

  // --- Sync editable fields when article changes ---
  useEffect(() => {
    if (article) {
      setEditTitle(article.title ?? '')
      setEditSubtitle(article.subtitle ?? '')
      setEditSections(Array.isArray(article.sections) ? article.sections.map(s => ({ ...s })) : [])
    }
  }, [article])

  // --- Sample data toggle ---
  useEffect(() => {
    if (sampleMode) {
      setArticle(SAMPLE_ARTICLE)
      setNotes(SAMPLE_NOTES)
      setSuggestions(SAMPLE_SUGGESTIONS)
      setTopic('The Hidden Economics of Attention')
      setArticleError(null)
      setNotesError(null)
      setIdeasError(null)
    } else {
      setArticle(null)
      setNotes([])
      setSuggestions([])
      setTopic('')
    }
  }, [sampleMode])

  // --- Generate Article ---
  const handleGenerateArticle = useCallback(async () => {
    if (!topic.trim()) return
    setLoadingArticle(true)
    setArticleError(null)
    setNotes([])
    setNotesError(null)
    setActiveAgentId(CONTENT_ORCHESTRATOR_ID)

    const message = `Write a comprehensive newsletter article about: ${topic.trim()}.\nTone: ${tone}. Audience: ${audience}. Length: ${length}.\nAdditional context: The article should be well-structured with clear sections, engaging writing, and actionable insights.`

    try {
      const result = await callAIAgent(message, CONTENT_ORCHESTRATOR_ID)
      if (result.success) {
        const data = result?.response?.result
        const parsed: ArticleData = {
          title: data?.title ?? '',
          subtitle: data?.subtitle ?? '',
          meta_description: data?.meta_description ?? '',
          article_body: data?.article_body ?? '',
          sections: Array.isArray(data?.sections) ? data.sections : [],
          seo_keywords: Array.isArray(data?.seo_keywords) ? data.seo_keywords : [],
          sources: Array.isArray(data?.sources) ? data.sources : [],
          topic_suggestions: Array.isArray(data?.topic_suggestions) ? data.topic_suggestions : [],
        }
        setArticle(parsed)

        // Save to history
        const entry: HistoryEntry = {
          id: Date.now().toString(),
          title: parsed.title || topic.trim(),
          subtitle: parsed.subtitle || '',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          article: parsed,
          notes: [],
        }
        saveHistory([entry, ...history])
      } else {
        setArticleError(result?.error ?? result?.response?.message ?? 'Failed to generate article. Please try again.')
      }
    } catch (err) {
      setArticleError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoadingArticle(false)
      setActiveAgentId(null)
    }
  }, [topic, tone, audience, length, history, saveHistory])

  // --- Generate Ideas ---
  const handleIdeate = useCallback(async () => {
    setLoadingIdeas(true)
    setIdeasError(null)
    setActiveAgentId(CONTENT_ORCHESTRATOR_ID)

    const message = 'Generate 5 creative and engaging topic ideas for a Substack newsletter. The topics should be trending, thought-provoking, and suitable for a wide newsletter audience. Return them in the topic_suggestions field.'

    try {
      const result = await callAIAgent(message, CONTENT_ORCHESTRATOR_ID)
      if (result.success) {
        const data = result?.response?.result
        const topics = Array.isArray(data?.topic_suggestions) ? data.topic_suggestions : []
        if (topics.length > 0) {
          setSuggestions(topics)
        } else {
          setIdeasError('No suggestions were returned. Try again.')
        }
      } else {
        setIdeasError(result?.error ?? 'Failed to generate ideas.')
      }
    } catch (err) {
      setIdeasError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoadingIdeas(false)
      setActiveAgentId(null)
    }
  }, [])

  // --- Generate Notes ---
  const handleGenerateNotes = useCallback(async () => {
    if (!article) return
    setLoadingNotes(true)
    setNotesError(null)
    setActiveAgentId(NOTES_CREATOR_ID)

    const sectionsText = Array.isArray(editSections)
      ? editSections.map(s => `## ${s.heading ?? ''}\n${s.content ?? ''}`).join('\n\n')
      : ''
    const fullText = `${editTitle}\n\n${editSubtitle}\n\n${sectionsText}`

    const message = `Transform Newsletter Content into High-Converting Substack Notes.

Take the core insights from the following article and create 3-5 Substack Notes.

ABSOLUTE PROHIBITIONS - NEVER INCLUDE:
- Rhetorical questions (ZERO TOLERANCE) - No questions whatsoever. Every sentence must be a statement or observation.
- Generic motivational endings
- Rounded numbers (use exact figures)
- "You can do it" variations
- Questions disguised as statements

Length Variety (MANDATORY) - Create a mix from: Micro (10-30 words), Short (30-80 words), Medium (80-150 words), Long (150-250 words).

Each Note must include: Specific numbers/timelines, a transformation moment (before to after state), vulnerable middle, permission-giving ending (implied, not stated directly).

Rotate between styles: The Confession, The Comparison Flip, The Moment Story, The Data Truth.

Value Formulas (choose one per Note): Validation Formula, Permission Formula, Reality Check, Timeline Truth.

Endings That Convert: Implied permission, specific hope with timeline, success reframe, vulnerable admission.

FINAL CHECK: Contains ZERO questions, all statements are declarations, numbers are specific, no generic motivation, vulnerability is specific.

Article Title: ${editTitle}
Article Content:
${fullText}`

    try {
      const result = await callAIAgent(message, NOTES_CREATOR_ID)
      if (result.success) {
        const data = result?.response?.result
        const parsedNotes = Array.isArray(data?.notes) ? data.notes : []
        setNotes(parsedNotes)

        // Update history entry with notes
        if (history.length > 0 && history[0]?.article?.title === article.title) {
          const updatedHistory = [...history]
          updatedHistory[0] = { ...updatedHistory[0], notes: parsedNotes }
          saveHistory(updatedHistory)
        }
      } else {
        setNotesError(result?.error ?? 'Failed to generate notes.')
      }
    } catch (err) {
      setNotesError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoadingNotes(false)
      setActiveAgentId(null)
    }
  }, [article, editTitle, editSubtitle, editSections, history, saveHistory])

  // --- Copy Full Article ---
  const handleCopyArticle = useCallback(() => {
    if (!article) return
    const sectionsText = editSections
      .map(s => `## ${s.heading ?? ''}\n\n${s.content ?? ''}`)
      .join('\n\n')
    const keywords = Array.isArray(article.seo_keywords) ? article.seo_keywords.join(', ') : ''
    const sources = Array.isArray(article.sources) ? article.sources.map((s, i) => `${i + 1}. ${s}`).join('\n') : ''
    const fullText = `# ${editTitle}\n\n${editSubtitle}\n\n${sectionsText}\n\n---\n\nSEO Keywords: ${keywords}\n\nSources:\n${sources}`
    copyText(fullText, 'full-article')
  }, [article, editTitle, editSubtitle, editSections, copyText])

  // --- Load from history ---
  const handleSelectHistory = useCallback((entry: HistoryEntry) => {
    setArticle(entry.article)
    setNotes(Array.isArray(entry.notes) ? entry.notes : [])
    setTopic(entry.article?.title ?? '')
    setSidebarOpen(false)
    setSampleMode(false)
  }, [])

  // --- Delete from history ---
  const handleDeleteHistory = useCallback((id: string) => {
    const updated = history.filter(e => e.id !== id)
    saveHistory(updated)
  }, [history, saveHistory])

  // --- Edit section ---
  const updateSectionContent = useCallback((index: number, field: 'heading' | 'content', value: string) => {
    setEditSections(prev => {
      const updated = [...prev]
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value }
      }
      return updated
    })
  }, [])

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <ErrorBoundary>
      <div style={THEME_VARS} className="min-h-screen bg-background text-foreground font-sans">
        {/* HISTORY SIDEBAR */}
        <HistorySidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          history={history}
          onSelect={handleSelectHistory}
          onDelete={handleDeleteHistory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* OVERLAY */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setSidebarOpen(false)} />
        )}

        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-card border-b border-border">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none"
                  onClick={() => setSidebarOpen(true)}
                >
                  <FiMenu className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <FiBookOpen className="h-5 w-5 text-[hsl(0,80%,45%)]" />
                  <h1 className="font-serif text-xl font-bold tracking-tight">Substack Content Studio</h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground font-medium">
                  Sample Data
                </Label>
                <Switch
                  id="sample-toggle"
                  checked={sampleMode}
                  onCheckedChange={setSampleMode}
                />
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ========================================= */}
            {/* LEFT PANEL - INPUT / CONFIG (1/3)        */}
            {/* ========================================= */}
            <div className="w-full lg:w-[380px] shrink-0 space-y-5">
              {/* TOPIC INPUT */}
              <Card className="rounded-none shadow-none border border-border">
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="font-serif text-base font-bold tracking-tight flex items-center gap-2">
                    <FiEdit3 className="h-4 w-4 text-[hsl(0,80%,45%)]" />
                    Topic
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Enter a topic or paste content to repurpose into a newsletter article.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-3">
                  <Textarea
                    placeholder="Enter your topic or paste content to repurpose..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="rounded-none min-h-[120px] text-sm leading-relaxed resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none text-xs gap-1.5"
                      onClick={handleIdeate}
                      disabled={loadingIdeas || loadingArticle}
                    >
                      {loadingIdeas ? (
                        <FiRefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FiZap className="h-3.5 w-3.5" />
                      )}
                      {loadingIdeas ? 'Generating...' : 'Ideate'}
                    </Button>
                  </div>

                  {/* IDEAS ERROR */}
                  {ideasError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700">
                      <FiAlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p>{ideasError}</p>
                        <button onClick={handleIdeate} className="underline mt-1 font-medium">Retry</button>
                      </div>
                    </div>
                  )}

                  {/* SUGGESTIONS */}
                  {suggestions.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Topic Ideas</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => { setTopic(s); setSuggestions([]) }}
                            className="text-left text-xs px-2.5 py-1.5 border border-border bg-secondary/50 hover:bg-secondary transition-colors font-medium"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CONFIG */}
              <Card className="rounded-none shadow-none border border-border">
                <Collapsible open={configOpen} onOpenChange={setConfigOpen}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="p-5 pb-3 cursor-pointer">
                      <CardTitle className="font-serif text-base font-bold tracking-tight flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <FiSettings className="h-4 w-4 text-[hsl(0,80%,45%)]" />
                          Configuration
                        </span>
                        {configOpen ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="p-5 pt-0 space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Tone</Label>
                        <Select value={tone} onValueChange={setTone}>
                          <SelectTrigger className="rounded-none text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-none">
                            <SelectItem value="Informative">Informative</SelectItem>
                            <SelectItem value="Conversational">Conversational</SelectItem>
                            <SelectItem value="Persuasive">Persuasive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Audience</Label>
                        <Select value={audience} onValueChange={setAudience}>
                          <SelectTrigger className="rounded-none text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-none">
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="Tech">Tech</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="Creative">Creative</SelectItem>
                            <SelectItem value="Health">Health</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Length</Label>
                        <Select value={length} onValueChange={setLength}>
                          <SelectTrigger className="rounded-none text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-none">
                            <SelectItem value="Short (~800 words)">Short (~800 words)</SelectItem>
                            <SelectItem value="Standard (~1500 words)">Standard (~1500 words)</SelectItem>
                            <SelectItem value="Long-form (~2500+ words)">Long-form (~2500+ words)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* GENERATE CTA */}
              <Button
                className="w-full rounded-none h-11 text-sm font-semibold gap-2 tracking-tight"
                onClick={handleGenerateArticle}
                disabled={loadingArticle || !topic.trim()}
              >
                {loadingArticle ? (
                  <FiRefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <FiSend className="h-4 w-4" />
                )}
                {loadingArticle ? 'Generating Article...' : 'Generate Article Draft'}
              </Button>

              {/* AGENT STATUS */}
              <AgentStatusPanel activeAgentId={activeAgentId} />
            </div>

            {/* ========================================= */}
            {/* RIGHT PANEL - OUTPUT (2/3)               */}
            {/* ========================================= */}
            <div className="flex-1 min-w-0 space-y-5">
              {/* ARTICLE ERROR */}
              {articleError && (
                <div className="flex items-start gap-3 p-4 border border-red-200 bg-red-50 text-red-700">
                  <FiAlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Failed to generate article</p>
                    <p className="text-xs mt-1">{articleError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 rounded-none text-xs text-red-700 border-red-300 hover:bg-red-100"
                      onClick={handleGenerateArticle}
                    >
                      <FiRefreshCw className="h-3 w-3 mr-1.5" /> Retry
                    </Button>
                  </div>
                </div>
              )}

              {/* LOADING STATE */}
              {loadingArticle && (
                <Card className="rounded-none shadow-none border border-border">
                  <CardContent className="p-0">
                    <ArticleSkeleton />
                  </CardContent>
                </Card>
              )}

              {/* EMPTY STATE */}
              {!article && !loadingArticle && !articleError && (
                <Card className="rounded-none shadow-none border border-border">
                  <CardContent className="p-0">
                    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                      <FiFileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
                      <h3 className="font-serif text-xl font-bold tracking-tight mb-2">Start by entering a topic</h3>
                      <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                        Type a topic in the input field or click Ideate to generate topic ideas.
                        The Content Orchestrator will coordinate research, drafting, and SEO optimization
                        to produce a polished newsletter article.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ARTICLE DISPLAY */}
              {article && !loadingArticle && (
                <Card className="rounded-none shadow-none border border-border">
                  <CardContent className="p-0">
                    {/* ARTICLE HEADER */}
                    <div className="p-6 pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* TITLE - EDITABLE */}
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setEditTitle(e.currentTarget.textContent ?? '')}
                            className="font-serif text-2xl sm:text-3xl font-bold tracking-tight leading-tight outline-none border-b border-transparent focus:border-border pb-1 transition-colors"
                          >
                            {editTitle}
                          </div>
                          {/* SUBTITLE - EDITABLE */}
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setEditSubtitle(e.currentTarget.textContent ?? '')}
                            className="text-base sm:text-lg text-muted-foreground mt-2 leading-relaxed outline-none border-b border-transparent focus:border-border pb-1 transition-colors"
                          >
                            {editSubtitle}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none text-xs gap-1.5 shrink-0"
                          onClick={handleCopyArticle}
                        >
                          {copiedId === 'full-article' ? (
                            <><FiCheck className="h-3.5 w-3.5 text-green-600" /> Copied</>
                          ) : (
                            <><FiCopy className="h-3.5 w-3.5" /> Copy All</>
                          )}
                        </Button>
                      </div>

                      {/* META DESCRIPTION */}
                      {(article.meta_description ?? '') !== '' && (
                        <div className="mt-4 p-3 bg-secondary/50 border border-border">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Meta Description</Label>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{article.meta_description}</p>
                        </div>
                      )}
                    </div>

                    <Separator className="my-6" />

                    {/* ARTICLE SECTIONS */}
                    <div className="px-6 pb-6 space-y-6">
                      {/* If we have sections, render them */}
                      {editSections.length > 0 ? (
                        editSections.map((section, i) => (
                          <div key={i} className="space-y-2">
                            <div
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => updateSectionContent(i, 'heading', e.currentTarget.textContent ?? '')}
                              className="font-serif text-lg font-bold tracking-tight outline-none border-b border-transparent focus:border-border pb-0.5 transition-colors"
                            >
                              {section.heading ?? ''}
                            </div>
                            <div className="text-sm leading-7 text-foreground/90">
                              {renderMarkdown(section.content ?? '')}
                            </div>
                          </div>
                        ))
                      ) : (article.article_body ?? '') !== '' ? (
                        <div className="text-sm leading-7 text-foreground/90">
                          {renderMarkdown(article.article_body)}
                        </div>
                      ) : null}

                      {/* SEO KEYWORDS */}
                      {Array.isArray(article.seo_keywords) && article.seo_keywords.length > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">SEO Keywords</Label>
                            <div className="flex flex-wrap gap-1.5">
                              {article.seo_keywords.map((kw, i) => (
                                <Badge key={i} variant="outline" className="rounded-none text-xs font-normal">
                                  {kw}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* SOURCES */}
                      {Array.isArray(article.sources) && article.sources.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Sources</Label>
                          <ol className="list-decimal list-inside space-y-1">
                            {article.sources.map((src, i) => (
                              <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                                {(src ?? '').startsWith('http') ? (
                                  <a href={src} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
                                    {src}
                                  </a>
                                ) : (
                                  src
                                )}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* NOTES SECTION */}
              {article && !loadingArticle && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-lg font-bold tracking-tight flex items-center gap-2">
                      <FiFileText className="h-4 w-4 text-[hsl(0,80%,45%)]" />
                      Substack Notes
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none text-xs gap-1.5"
                      onClick={handleGenerateNotes}
                      disabled={loadingNotes}
                    >
                      {loadingNotes ? (
                        <FiRefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FiZap className="h-3.5 w-3.5" />
                      )}
                      {loadingNotes ? 'Generating...' : 'Generate Notes'}
                    </Button>
                  </div>

                  {/* NOTES ERROR */}
                  {notesError && (
                    <div className="flex items-start gap-2 p-3 border border-red-200 bg-red-50 text-red-700">
                      <FiAlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p>{notesError}</p>
                        <button onClick={handleGenerateNotes} className="underline mt-1 font-medium">Retry</button>
                      </div>
                    </div>
                  )}

                  {/* NOTES LOADING */}
                  {loadingNotes && <NotesSkeleton />}

                  {/* NOTES LIST */}
                  {!loadingNotes && notes.length > 0 && (
                    <div className="space-y-3">
                      {notes.map((note, i) => (
                        <NoteCard
                          key={i}
                          note={note}
                          index={i}
                          copiedId={copiedId}
                          onCopy={copyText}
                        />
                      ))}
                    </div>
                  )}

                  {/* NOTES EMPTY STATE */}
                  {!loadingNotes && notes.length === 0 && !notesError && (
                    <Card className="rounded-none shadow-none border border-border border-dashed">
                      <CardContent className="p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          Click "Generate Notes" to create promotional Substack Notes from your article.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
