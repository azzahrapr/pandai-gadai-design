# Cortes Design System – Tokens

Extracted from **Design System - Token - Cortes** (`z7ICZsSXSxtFXB2VxtGj70`).  
Source: exported JSON from Figma Variables panel (Primitives, Semantic, Radius, Spacing, Typography collections).

---

## Colors – Global Palette (Primitives)

Primitive color scales. **Do not use these directly in components — use semantic tokens instead.**

### Base
| Token | Hex |
|---|---|
| `base/black` | `#0F1729` |
| `base/white` | `#FFFFFF` |

### Slate
| Token | Hex |
|---|---|
| `slate/50` | `#F8FAFC` |
| `slate/100` | `#F1F5F9` |
| `slate/200` | `#E1E7EF` |
| `slate/300` | `#CBD5E1` |
| `slate/400` | `#94A3B8` |
| `slate/500` | `#65758B` |
| `slate/600` | `#48566A` |
| `slate/700` | `#344256` |
| `slate/800` | `#1D283A` |
| `slate/900` | `#0F1729` |
| `slate/950` | `#020617` |

### Blue (Primary)
| Token | Hex |
|---|---|
| `blue/50` | `#E5F2FF` |
| `blue/100` | `#CFE7FF` |
| `blue/200` | `#A8CFFF` |
| `blue/300` | `#73AEFF` |
| `blue/400` | `#3D7AFF` |
| `blue/500` | `#023DFF` |
| `blue/600` | `#0020E3` |
| `blue/700` | `#001CDB` |
| `blue/800` | `#051DAE` |
| `blue/900` | `#0E2287` |
| `blue/950` | `#09134E` |

### Yellow (Secondary)
| Token | Hex |
|---|---|
| `yellow/50` | `#FEFDEA` |
| `yellow/100` | `#FFFDC6` |
| `yellow/200` | `#FFF88F` |
| `yellow/300` | `#FFEC4F` |
| `yellow/400` | `#FFDA14` |
| `yellow/500` | `#FFCD05` |
| `yellow/600` | `#E0A200` |
| `yellow/700` | `#B27202` |
| `yellow/800` | `#94590A` |
| `yellow/900` | `#7E480F` |
| `yellow/950` | `#492504` |

### Red
| Token | Hex |
|---|---|
| `red/50` | `#FEF2F2` |
| `red/100` | `#FEE2E2` |
| `red/200` | `#FECACA` |
| `red/300` | `#FCA5A5` |
| `red/400` | `#F87171` |
| `red/500` | `#EF4444` |
| `red/600` | `#DC2626` |
| `red/700` | `#B91C1C` |
| `red/800` | `#991B1B` |
| `red/900` | `#7F1D1D` |
| `red/950` | `#450A0A` |

### Green
| Token | Hex |
|---|---|
| `green/50` | `#F0FDF4` |
| `green/100` | `#DCFCE7` |
| `green/200` | `#BBF7D0` |
| `green/300` | `#86EFAC` |
| `green/400` | `#4ADE80` |
| `green/500` | `#22C55E` |
| `green/600` | `#16A34A` |
| `green/700` | `#15803D` |
| `green/800` | `#166534` |
| `green/900` | `#14532D` |
| `green/950` | `#052E16` |

### Purple
| Token | Hex |
|---|---|
| `purple/50` | `#FAF5FF` |
| `purple/100` | `#F3E8FF` |
| `purple/200` | `#E9D5FF` |
| `purple/300` | `#D8B4FE` |
| `purple/400` | `#C084FC` |
| `purple/500` | `#A855F7` |
| `purple/600` | `#9333EA` |
| `purple/700` | `#7E22CE` |
| `purple/800` | `#6B21A8` |
| `purple/900` | `#581C87` |
| `purple/950` | `#3B0764` |

---

## Colors – Semantic Tokens

**Always use these in components, not raw palette values.**

### Background
| Token | Maps to | Hex |
|---|---|---|
| `background/primary` | blue/500 | `#023DFF` |
| `background/primary-darker` | blue/700 | `#001CDB` |
| `background/secondary` | yellow/500 | `#FFCD05` |
| `background/neutral` | base/white | `#FFFFFF` |
| `background/subtle` | slate/50 | `#F8FAFC` |
| `background/disabled` | slate/200 | `#E1E7EF` |
| `background/dark` | slate/900 | `#0F1729` |
| `background/dark-secondary` | slate/700 | `#344256` |
| `background/success` | green/600 | `#16A34A` |
| `background/success-subtle` | green/50 | `#F0FDF4` |
| `background/warning` | yellow/600 | `#E0A200` |
| `background/warning-subtle` | yellow/50 | `#FEFDEA` |
| `background/error` | red/600 | `#DC2626` |
| `background/error-subtle` | red/50 | `#FEF2F2` |
| `background/info-subtle` | blue/50 | `#E5F2FF` |

### Text
| Token | Maps to | Hex |
|---|---|---|
| `text/default` | slate/900 | `#0F1729` |
| `text/subtle` | slate/500 | `#65758B` |
| `text/disabled` | slate/400 | `#94A3B8` |
| `text/neutral` | base/white | `#FFFFFF` |
| `text/link` | blue/500 | `#023DFF` |
| `text/info` | blue/700 | `#001CDB` |
| `text/success` | green/700 | `#15803D` |
| `text/warning` | yellow/700 | `#B27202` |
| `text/error` | red/700 | `#B91C1C` |

### Border
| Token | Maps to | Hex |
|---|---|---|
| `border/default` | slate/300 | `#CBD5E1` |
| `border/subtle` | slate/200 | `#E1E7EF` |
| `border/hover` | slate/400 | `#94A3B8` |
| `border/neutral` | base/white | `#FFFFFF` |
| `border/info` | blue/500 | `#023DFF` |
| `border/success` | green/600 | `#16A34A` |
| `border/warning` | yellow/600 | `#E0A200` |
| `border/error` | red/600 | `#DC2626` |

### Icon
| Token | Maps to | Hex |
|---|---|---|
| `icon/default` | slate/900 | `#0F1729` |
| `icon/subtle` | slate/500 | `#65758B` |
| `icon/disabled` | slate/400 | `#94A3B8` |
| `icon/neutral` | base/white | `#FFFFFF` |
| `icon/info` | blue/600 | `#0020E3` |
| `icon/success` | green/600 | `#16A34A` |
| `icon/warning` | yellow/600 | `#E0A200` |
| `icon/error` | red/600 | `#DC2626` |

### Decoration
| Token | Maps to | Hex |
|---|---|---|
| `decoration/warm-light` | yellow/200 | `#FFF88F` |
| `decoration/warm` | yellow/500 | `#FFCD05` |
| `decoration/warm-dark` | yellow/800 | `#94590A` |
| `decoration/cool-light` | purple/200 | `#E9D5FF` |
| `decoration/cool` | purple/500 | `#A855F7` |
| `decoration/cool-dark` | purple/800 | `#6B21A8` |

### Overlay
| Token | Value |
|---|---|
| `overlay/default` | `rgba(15, 17, 41, 0.7)` |

---

## Typography

Font family: **Geist** (all mobile styles)

| Style | Size | Weight | Line Height | Letter Spacing | Style Key |
|---|---|---|---|---|---|
| `Heading 1` | 48 | 700 Bold | 60px | -1.2% | `7d4a5ca77168efcf34f106eb7bdbf95d1d7d204c` |
| `Heading 2` | 36 | 700 Bold | 48px | 0 | `b56f24c2f1fb5179e0ee5f566804c77d7e084b5b` |
| `Heading 3` | 28 | 700 Bold | 36px | -0.6% | `107be6a7a4d8b63f985f80fc484c6d310785a753` |
| `Title 1` | 20 | 700 Bold | 32px | 0 | `79b24449904565450c2c94017e2f88ba8aaa7699` |
| `Title 2` | 18 | 600 SemiBold | 28px | 0 | `eb5b50585137a7e6247937288e53e46a68fa277b` |
| `Subtitle 1` | 16 | 600 SemiBold | 24px | 0 | `324448cebfb535c8ef7dc55bd7beb778ff51e701` |
| `Subtitle 2` | 14 | 600 SemiBold | 22px | 0 | `1d22a8b3e69c1f3f7bb11f31db4f308d18f0fa86` |
| `Body 1` | 16 | 400 Regular | 24px | 0 | `56b5a8852c175d8641935df0a690cc6b34b81b91` |
| `Body 2` | 14 | 400 Regular | 20px | 0 | `accdf7d79acb2306387ada6494f82540a775e8a9` |
| `Caption 1` | 12 | 400 Regular | 16px | 0 | `f0d7971ca6b6e4388ae8cfd5baafe21ba0757eb8` |
| `Caption 2` | 10 | 400 Regular | 12px | 0 | `2377d8475ecb2ef0317185f3483d03ee2c486246` |
| `Label 1` | 12 | 700 Bold | 16px | 0 | `397c7d333d42da3b25b51148c9f3555ad250087e` |
| `Label 2` | 10 | 700 Bold | 12px | 0 | `35fd36bee1bbc7aa4941a10b048d8e9f7c515603` |


---

## Radius

| Token | Value |
|---|---|
| `rounded-none` | 0px |
| `rounded-sm` | 4px |
| `rounded` | 6px |
| `rounded-lg` | 8px |
| `rounded-xl` | 10px |
| `rounded-2xl` | 12px |
| `rounded-3xl` | 16px |
| `rounded-full` | 9999px |

---

## Spacing

| Token | Value |
|---|---|
| `spacing-0` | 0px |
| `spacing-1` | 4px |
| `spacing-2` | 8px |
| `spacing-3` | 12px |
| `spacing-4` | 16px |
| `spacing-5` | 20px |
| `spacing-6` | 24px |
| `spacing-8` | 32px |
| `spacing-10` | 40px |
| `spacing-12` | 48px |
| `spacing-16` | 64px |
| `spacing-20` | 80px |
| `spacing-24` | 96px |
| `spacing-32` | 128px |
| `spacing-40` | 160px |
| `spacing-48` | 192px |
| `spacing-64` | 256px |
| `spacing-80` | 320px |
| `spacing-96` | 384px |

---

## Figma Variable Keys

Use these keys with `figma.variables.importVariableByKeyAsync(key)` in plugin code to bind tokens to nodes.

### Semantic – Background
| Token | Key |
|---|---|
| `background/primary` | `9bd0d35189e53774a33ed62ef3efacc063980d6c` |
| `background/primary-darker` | `363b342c94b94f5fa9eff85640fab9beaae522e6` |
| `background/secondary` | `a87fd7a6167f62941e45e6e58537c279130c6e34` |
| `background/neutral` | `e604299de5c1a77c302e2fe9ebbafc31ee26e07b` |
| `background/subtle` | `29348827b4f6f800155f9e4c58580aa932e84e54` |
| `background/disabled` | `bb484feba313487d57c6fbae2c7c6abbd44a9152` |
| `background/dark` | `75418a29bc7e8c74a88f4d8ad1e26a3741b8e552` |
| `background/dark-secondary` | `06ebae5a5cc19c55d6b770497b8e5bc4747e5021` |
| `background/success` | `5166a4cc8f771c3be83c0145bdb0d1007f8410b9` |
| `background/success-subtle` | `b996ca0e64a673886d78b38bb973900edbeefecc` |
| `background/warning` | `892e6e5f0249efbdc2f6210b7f276830ea12fa5e` |
| `background/warning-subtle` | `614c9c60322d006e1cc5955dd9edac4bef282987` |
| `background/error` | `ce7e9441ea9ee25c539bcc9b746eae815421caba` |
| `background/error-subtle` | `578abf67833a0fe712da5971c97a0562f0334d96` |
| `background/info-subtle` | `3c06ceb6c31f00891c6e7478a620a6095d5c69e3` |

### Semantic – Text
| Token | Key |
|---|---|
| `text/default` | `4fdf372ab51be6542fa6ee318a4fbd425b819d74` |
| `text/subtle` | `8d7ce13dfe09c2d3fc82852e2d0553d1c06c20da` |
| `text/disabled` | `251fdcd4b07f9457902ea5e691805d8559dfd0f5` |
| `text/neutral` | `3167ca369b52121d1ba79e564161a58ba3b9f1f0` |
| `text/link` | `2a4e30fd6bae32fc5408854be0cab83051061987` |
| `text/info` | `03aa3a17f29ece387f5710b4d18e10508d7f8112` |
| `text/success` | `84da0b130669a4459368610eaf667c5aea8901e6` |
| `text/warning` | `eb034e7e4ca022e37a8477177f39ab0128d5599c` |
| `text/error` | `4141f6fe9240732c08205a22a189698a19af497c` |

### Semantic – Border
| Token | Key |
|---|---|
| `border/default` | `c86b946998139eaeab09c00ac252940990190c53` |
| `border/subtle` | `d53135704f552ea3a267b44c22494b17f553554f` |
| `border/hover` | `6fb2e85b5420abf03b980277cb36c8a925735af5` |
| `border/neutral` | `f4c65afa0f64759c6b2599b836926e1d76fd8692` |
| `border/info` | `6713165ed9c193bc0d79df65954ebe6dd513fe25` |
| `border/success` | `007cc8eb661a8dba171f74bd7c96d89ad51c954c` |
| `border/warning` | `7ade9c5699d38fbc4027bc2e94bfa43a3f902409` |
| `border/error` | `09793c7c4471f11f461c70d02170608286b7b23c` |

### Semantic – Icon
| Token | Key |
|---|---|
| `icon/default` | `f415ce3d7356ffc3d3069ecf3d21c0c011d058f2` |
| `icon/subtle` | `7f334cb061a52e458774f64eb2c2165b1e9b817b` |
| `icon/disabled` | `57e82be683d9bd539cc4da243727d721c79c9c9c` |
| `icon/neutral` | `b24de9c36ebe2c0c6a3af10157c05a738a198a10` |
| `icon/info` | `e94db94f176051817bfa5aa65b4e5cf1760d5971` |
| `icon/success` | `88aafb55785ec0ddbc3c87eee15cb378610994cf` |
| `icon/warning` | `d0aebbfdb3e40b1cc327599d7015a152238bb410` |
| `icon/error` | `7cf286c3812bba914d99553e1e6aef5e75e19a41` |

### Semantic – Decoration & Overlay
| Token | Key |
|---|---|
| `decoration/warm-light` | `9197cd7e7d2cbd2dd29b9288d75dfa06327c92f0` |
| `decoration/warm` | `30eadd252a6aae194b88945805fb8bfa42c635af` |
| `decoration/warm-dark` | `6ee61098b38421feb63f7f0a138cb15fb26fb884` |
| `decoration/cool-light` | `dea341166301d462a06e697e1db0049f2c48f3fd` |
| `decoration/cool` | `fd42cfba3874aeafa78138180718d77acb809860` |
| `decoration/cool-dark` | `84feac041b86ecd6f7ae4da1eb855024ecf29e37` |
| `overlay/default` | `20189d0d7ea2a3221ca91b5d1f0a415b21bf51dc` |

### Radius
| Token | Key |
|---|---|
| `rounded-none` | `c8cb6810a1b881068e7bf6bede4490a94efb75fb` |
| `rounded-sm` | `19276f266ab173610ee841cb0b2d5621013d88f9` |
| `rounded` | `8efcc39529b5935eee76cc17a321c7663c866d7c` |
| `rounded-lg` | `cf48e7600d5443fa95ee5f4f365e5938928f4115` |
| `rounded-xl` | `013e53497904606f09efcdac335b165a846c0700` |
| `rounded-2xl` | `fac7c288a9b2df24687d23239e9f5de6336a0e99` |
| `rounded-3xl` | `3dd22ee5c915e455b992374885d50676d28dc9b0` |
| `rounded-full` | `c8e4e2f9671733eb1f640a9bc1c06f8f143154de` |

### Spacing
| Token | Key |
|---|---|
| `spacing-0` | `a252ce71e2f42ee0318d2ae1aca0b05444c0a900` |
| `spacing-1` | `81b1c6a35826fb71547eec3e9fff7b028905d349` |
| `spacing-2` | `55d614c2b684271170800cf3314f556dae88ef2d` |
| `spacing-3` | `a94ef332eef6277c2b69b91055ee7184087a23b0` |
| `spacing-4` | `18db7dcd5448ed504368dbe6ef3dac04f859a01a` |
| `spacing-5` | `7c0c9b2d834a76ac454f320acf987fcdd95a0288` |
| `spacing-6` | `16c9055d0f9ee381ea0bfd5ee1af4320b7caa7dd` |
| `spacing-8` | `d3f26d659f931be10e282c9cc173be8f314b8069` |
| `spacing-10` | `885dde3b7bc7e69b93d85af8dbea0ba9a60c03e4` |
| `spacing-12` | `378b6814fe02c1b3f819c4557b099e4522b76847` |
| `spacing-16` | `30910602bd85de9f120dfbddef5b319d33585b9a` |
| `spacing-20` | `44d9dc15ad12be6621336057d69bf76c832ec78d` |
| `spacing-24` | `2440a0ad79e63730f2ae32fce5345289e2843407` |
| `spacing-32` | `b540aeb82d1b059de6ef4aaec8c86f73f6e54bf9` |
| `spacing-40` | `6c23e40a8335c3958111158659f06350e7d92756` |
| `spacing-48` | `b30f2b3f14a2d01d913298004500ba00a2099a6c` |
| `spacing-64` | `b745531c34acffb8302c460165b6de069b2b9269` |
| `spacing-80` | `fe0ae8dc336456b1974c5772ff3b5c765a8589b1` |
| `spacing-96` | `e874bb59e7c5e33698bbb47b65ddca3e7540d0a2` |

### Typography
| Token | Key |
|---|---|
| `font-styles/heading-1` | `f5d1603babc8986cae08963fe3802c049fa26a6e` |
| `font-styles/heading-2` | `97e2e7f7f2f1686ce4703d3c4b6a6182a4e9786c` |
| `font-styles/heading-3` | `d0a4ce94c3329526be59a7954acb90590c3551a1` |
| `font-styles/title-1` | `0c80a0e82ae1b19382f681ac861b0396dfe13b1d` |
| `font-styles/title-2` | `aa12e559eb44be43712d4fec53f44cf59e69d958` |
| `font-styles/subtitle-1` | `3efdb852205800a6244ef19f983a21ee6a561a5f` |
| `font-styles/subtitle-2` | `6e5c09208c8570c0d5abb93b083970a32c2b49f0` |
| `font-styles/body-1` | `eda72b772ebd1116aa813472b8e8a67abfa7dd03` |
| `font-styles/body-2` | `67fc97739d1b7e1f5656984eb5b4c523f07bc606` |
| `font-styles/caption-1` | `1bbc12a396dabe031f1cf0064dec6881aa449d2d` |
| `font-styles/caption-2` | `f66f45b64930fd53dc86cc1188e6f2fb49722806` |
| `font-styles/label-1` | `cd6cddf40e72f69476d3585b348a40e319f2f86a` |
| `font-styles/label-2` | `63336efd9c9823d6b41beea7df17d853e09732fd` |
