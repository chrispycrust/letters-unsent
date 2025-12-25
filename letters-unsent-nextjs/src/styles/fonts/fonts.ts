import { Cormorant_Garamond
        , Inter
        , Lora
        , Spectral
        , Geist
 } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--cormorant'
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--inter'
})

const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--lora'
})

const spectral = Spectral({
  subsets: ['latin'],
  display: 'swap',
  weight: ['200', '400', '500', '600', '700', '800'],
  variable: '--spectral'
})

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--geist',
  })

export { cormorant
        , inter
        , lora
        , spectral
        , geist
    }