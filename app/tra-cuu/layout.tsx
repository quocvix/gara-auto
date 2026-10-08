import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tra Cứu Bảo Hành Điện Tử — Duy Auto',
  description: 'Cổng tra cứu thời hạn và hồ sơ bảo hành điện tử chính hãng Duy Auto.',
}

export default function TraCuuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="force-light min-h-screen bg-background text-foreground flex flex-col">
      {children}
    </div>
  )
}
