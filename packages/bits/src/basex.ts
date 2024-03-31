//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import type { ByteStream } from './types'

function baseXOutputStream(base: number, bytesBuffer: number, baseBuffer: number, out: ByteStream): ByteStream {
  const Base = BigInt(base)
  const Byte = BigInt(256)

  if (Byte ** BigInt(bytesBuffer) > Base ** BigInt(baseBuffer))
    throw new Error('encodeBaseX: `baseBuffer` too small for `bytesBuffer`')

  const send = (char: BigInt) => out.byte(Number(char))

  let buffer = 1n
  let bytes = 0

  return {
    byte(value: number) {
      buffer *= Byte
      buffer += BigInt(value)
      if (++bytes === bytesBuffer) {
        for (let i = 0; i < baseBuffer; i++) {
          send(buffer % Base)
          buffer /= Base
        }
        buffer = 1n
        bytes = 0
      }
    },
    close() {
      while (bytes !== 0 && buffer !== 0n) {
        send(buffer % Base)
        buffer /= Base
      }
      out.close()
    },
  }
}

const special = '\'"`'
const firstChar = 0x21
const lastChar = 0x7e
const base91 = lastChar - firstChar + 1 - special.length

export const base91OutputStream = (out: ByteStream) =>
  baseXOutputStream(base91, 13, 16, {
    byte(x: number) {
      const char = x + firstChar
      const i = special.indexOf(String.fromCharCode(char))
      out.byte(i >= 0 ? lastChar - i : char)
    },
    close: out.close,
  })
