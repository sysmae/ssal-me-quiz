import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface Props {
  content: string
}

export default function TextWithCodeBlock({ content }: Props) {
  // 언어명 뒤에 공백/줄바꿈이 있든 없든 모두 허용
  const regex = /```(\w+)?\s*([\s\S]*?)```/g

  const elements: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      elements.push(
        <span key={lastIndex}>{content.slice(lastIndex, match.index)}</span>
      )
    }
    const lang = match[1] || 'plaintext'
    const code = match[2].replace(/;\s*/g, ';\n')
    elements.push(
      <SyntaxHighlighter
        key={match.index}
        language={lang}
        style={solarizedlight}
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    )
    lastIndex = regex.lastIndex
  }

  if (lastIndex < content.length) {
    elements.push(<span key={lastIndex}>{content.slice(lastIndex)}</span>)
  }

  return <>{elements}</>
}
