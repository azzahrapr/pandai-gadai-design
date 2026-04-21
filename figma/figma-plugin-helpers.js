/**
 * Figma Plugin Helpers — Cortes DS
 * Paste this at the top of every use_figma plugin call.
 * Provides token binding and text creation helpers that always connect to DS variables.
 */

// ─── Token Variable Keys ──────────────────────────────────────────────────────

const TOKEN_KEYS = {
  // Background
  'background/primary':        '9bd0d35189e53774a33ed62ef3efacc063980d6c',
  'background/primary-darker': '363b342c94b94f5fa9eff85640fab9beaae522e6',
  'background/secondary':      'a87fd7a6167f62941e45e6e58537c279130c6e34',
  'background/neutral':        'e604299de5c1a77c302e2fe9ebbafc31ee26e07b',
  'background/subtle':         '29348827b4f6f800155f9e4c58580aa932e84e54',
  'background/disabled':       'bb484feba313487d57c6fbae2c7c6abbd44a9152',
  'background/dark':           '75418a29bc7e8c74a88f4d8ad1e26a3741b8e552',
  'background/dark-secondary': '06ebae5a5cc19c55d6b770497b8e5bc4747e5021',
  'background/success':        '5166a4cc8f771c3be83c0145bdb0d1007f8410b9',
  'background/success-subtle': 'b996ca0e64a673886d78b38bb973900edbeefecc',
  'background/warning':        '892e6e5f0249efbdc2f6210b7f276830ea12fa5e',
  'background/warning-subtle': '614c9c60322d006e1cc5955dd9edac4bef282987',
  'background/error':          'ce7e9441ea9ee25c539bcc9b746eae815421caba',
  'background/error-subtle':   '578abf67833a0fe712da5971c97a0562f0334d96',
  'background/info-subtle':    '3c06ceb6c31f00891c6e7478a620a6095d5c69e3',

  // Text
  'text/default':  '4fdf372ab51be6542fa6ee318a4fbd425b819d74',
  'text/subtle':   '8d7ce13dfe09c2d3fc82852e2d0553d1c06c20da',
  'text/disabled': '251fdcd4b07f9457902ea5e691805d8559dfd0f5',
  'text/neutral':  '3167ca369b52121d1ba79e564161a58ba3b9f1f0',
  'text/link':     '2a4e30fd6bae32fc5408854be0cab83051061987',
  'text/info':     '03aa3a17f29ece387f5710b4d18e10508d7f8112',
  'text/success':  '84da0b130669a4459368610eaf667c5aea8901e6',
  'text/warning':  'eb034e7e4ca022e37a8477177f39ab0128d5599c',
  'text/error':    '4141f6fe9240732c08205a22a189698a19af497c',

  // Border
  'border/default': 'c86b946998139eaeab09c00ac252940990190c53',
  'border/subtle':  'd53135704f552ea3a267b44c22494b17f553554f',
  'border/hover':   '6fb2e85b5420abf03b980277cb36c8a925735af5',
  'border/neutral': 'f4c65afa0f64759c6b2599b836926e1d76fd8692',
  'border/info':    '6713165ed9c193bc0d79df65954ebe6dd513fe25',
  'border/success': '007cc8eb661a8dba171f74bd7c96d89ad51c954c',
  'border/warning': '7ade9c5699d38fbc4027bc2e94bfa43a3f902409',
  'border/error':   '09793c7c4471f11f461c70d02170608286b7b23c',

  // Icon
  'icon/default':  'f415ce3d7356ffc3d3069ecf3d21c0c011d058f2',
  'icon/subtle':   '7f334cb061a52e458774f64eb2c2165b1e9b817b',
  'icon/disabled': '57e82be683d9bd539cc4da243727d721c79c9c9c',
  'icon/neutral':  'b24de9c36ebe2c0c6a3af10157c05a738a198a10',
  'icon/info':     'e94db94f176051817bfa5aa65b4e5cf1760d5971',
  'icon/success':  '88aafb55785ec0ddbc3c87eee15cb378610994cf',
  'icon/warning':  'd0aebbfdb3e40b1cc327599d7015a152238bb410',
  'icon/error':    '7cf286c3812bba914d99553e1e6aef5e75e19a41',

  // Decoration & Overlay
  'decoration/warm-light': '9197cd7e7d2cbd2dd29b9288d75dfa06327c92f0',
  'decoration/warm':       '30eadd252a6aae194b88945805fb8bfa42c635af',
  'decoration/warm-dark':  '6ee61098b38421feb63f7f0a138cb15fb26fb884',
  'decoration/cool-light': 'dea341166301d462a06e697e1db0049f2c48f3fd',
  'decoration/cool':       'fd42cfba3874aeafa78138180718d77acb809860',
  'decoration/cool-dark':  '84feac041b86ecd6f7ae4da1eb855024ecf29e37',
  'overlay/default':       '20189d0d7ea2a3221ca91b5d1f0a415b21bf51dc',

  // Radius
  'rounded-none': 'c8cb6810a1b881068e7bf6bede4490a94efb75fb',
  'rounded-sm':   '19276f266ab173610ee841cb0b2d5621013d88f9',
  'rounded':      '8efcc39529b5935eee76cc17a321c7663c866d7c',
  'rounded-lg':   'cf48e7600d5443fa95ee5f4f365e5938928f4115',
  'rounded-xl':   '013e53497904606f09efcdac335b165a846c0700',
  'rounded-2xl':  'fac7c288a9b2df24687d23239e9f5de6336a0e99',
  'rounded-3xl':  '3dd22ee5c915e455b992374885d50676d28dc9b0',
  'rounded-full': 'c8e4e2f9671733eb1f640a9bc1c06f8f143154de',

  // Spacing
  'spacing-0':  'a252ce71e2f42ee0318d2ae1aca0b05444c0a900',
  'spacing-1':  '81b1c6a35826fb71547eec3e9fff7b028905d349',
  'spacing-2':  '55d614c2b684271170800cf3314f556dae88ef2d',
  'spacing-3':  'a94ef332eef6277c2b69b91055ee7184087a23b0',
  'spacing-4':  '18db7dcd5448ed504368dbe6ef3dac04f859a01a',
  'spacing-5':  '7c0c9b2d834a76ac454f320acf987fcdd95a0288',
  'spacing-6':  '16c9055d0f9ee381ea0bfd5ee1af4320b7caa7dd',
  'spacing-8':  'd3f26d659f931be10e282c9cc173be8f314b8069',
  'spacing-10': '885dde3b7bc7e69b93d85af8dbea0ba9a60c03e4',
  'spacing-12': '378b6814fe02c1b3f819c4557b099e4522b76847',
  'spacing-16': '30910602bd85de9f120dfbddef5b319d33585b9a',
  'spacing-20': '44d9dc15ad12be6621336057d69bf76c832ec78d',
  'spacing-24': '2440a0ad79e63730f2ae32fce5345289e2843407',
  'spacing-32': 'b540aeb82d1b059de6ef4aaec8c86f73f6e54bf9',
  'spacing-40': '6c23e40a8335c3958111158659f06350e7d92756',
  'spacing-48': 'b30f2b3f14a2d01d913298004500ba00a2099a6c',
  'spacing-64': 'b745531c34acffb8302c460165b6de069b2b9269',
  'spacing-80': 'fe0ae8dc336456b1974c5772ff3b5c765a8589b1',
  'spacing-96': 'e874bb59e7c5e33698bbb47b65ddca3e7540d0a2',

  // Typography — font size (use with fontSize binding)
  'font-size/heading-1':  'f5d1603babc8986cae08963fe3802c049fa26a6e',
  'font-size/heading-2':  '97e2e7f7f2f1686ce4703d3c4b6a6182a4e9786c',
  'font-size/heading-3':  'd0a4ce94c3329526be59a7954acb90590c3551a1',
  'font-size/title-1':    '0c80a0e82ae1b19382f681ac861b0396dfe13b1d',
  'font-size/title-2':    'aa12e559eb44be43712d4fec53f44cf59e69d958',
  'font-size/subtitle-1': '3efdb852205800a6244ef19f983a21ee6a561a5f',
  'font-size/subtitle-2': '6e5c09208c8570c0d5abb93b083970a32c2b49f0',
  'font-size/body-1':     'eda72b772ebd1116aa813472b8e8a67abfa7dd03',
  'font-size/body-2':     '67fc97739d1b7e1f5656984eb5b4c523f07bc606',
  'font-size/caption-1':  '1bbc12a396dabe031f1cf0064dec6881aa449d2d',
  'font-size/caption-2':  'f66f45b64930fd53dc86cc1188e6f2fb49722806',
  'font-size/label-1':    'cd6cddf40e72f69476d3585b348a40e319f2f86a',
  'font-size/label-2':    '63336efd9c9823d6b41beea7df17d853e09732fd',

  // Typography — font weight (use with fontStyle binding)
  'font-weight/regular':  '0886eb7bddc23812798a43809eaca0ad1ee04ccb',
  'font-weight/semibold': 'c871fe56076250e39e91cc90a8f1d38f4c025b33',
  'font-weight/bold':     'ea95ce74553f96291ae6720c1c377039ec6830bd',

  // Typography — font family (use with fontFamily binding)
  'font-family': '130a03014c9312eb0f34fb9721c516995303af6c',
};

// ─── Variable Cache ───────────────────────────────────────────────────────────

const _varCache = {};
async function getVar(token) {
  if (_varCache[token]) return _varCache[token];
  const key = TOKEN_KEYS[token];
  if (!key) throw new Error(`Unknown token: "${token}". Check TOKEN_KEYS.`);
  const v = await figma.variables.importVariableByKeyAsync(key);
  _varCache[token] = v;
  return v;
}

// ─── Color Binding ────────────────────────────────────────────────────────────

// Binds a color token to a node's fill. Works on frames, rectangles, and text nodes.
async function bindColor(node, token) {
  const v = await getVar(token);
  node.fills = [figma.variables.setBoundVariableForPaint(
    { type: 'SOLID', color: { r: 0, g: 0, b: 0 } },
    'color', v
  )];
}

// Binds a color token to a node's stroke.
async function bindStroke(node, token) {
  const v = await getVar(token);
  node.strokes = [figma.variables.setBoundVariableForPaint(
    { type: 'SOLID', color: { r: 0, g: 0, b: 0 } },
    'color', v
  )];
}

// ─── Text Style Keys ─────────────────────────────────────────────────────────
// Full Figma text styles — cover font family, size, weight, line height, letter spacing.
// Use applyTextStyle() to connect all typography properties at once.

const TEXT_STYLE_KEYS = {
  'heading-1':  '7d4a5ca77168efcf34f106eb7bdbf95d1d7d204c',  // 48 Bold  / lh:60  / ls:-1.2%
  'heading-2':  'b56f24c2f1fb5179e0ee5f566804c77d7e084b5b',  // 36 Bold  / lh:48  / ls:0
  'heading-3':  '107be6a7a4d8b63f985f80fc484c6d310785a753',  // 28 Bold  / lh:36  / ls:-0.6%
  'title-1':    '79b24449904565450c2c94017e2f88ba8aaa7699',  // 20 Bold  / lh:32  / ls:0
  'title-2':    'eb5b50585137a7e6247937288e53e46a68fa277b',  // 18 SemiBold / lh:28 / ls:0
  'subtitle-1': '324448cebfb535c8ef7dc55bd7beb778ff51e701',  // 16 SemiBold / lh:24 / ls:0
  'subtitle-2': '1d22a8b3e69c1f3f7bb11f31db4f308d18f0fa86',  // 14 SemiBold / lh:22 / ls:0
  'body-1':     '56b5a8852c175d8641935df0a690cc6b34b81b91',  // 16 Regular / lh:24 / ls:0
  'body-2':     'accdf7d79acb2306387ada6494f82540a775e8a9',  // 14 Regular / lh:20 / ls:0
  'caption-1':  'f0d7971ca6b6e4388ae8cfd5baafe21ba0757eb8',  // 12 Regular / lh:16 / ls:0
  'caption-2':  '2377d8475ecb2ef0317185f3483d03ee2c486246',  // 10 Regular / lh:12 / ls:0
  'label-1':    '397c7d333d42da3b25b51148c9f3555ad250087e',  // 12 Bold  / lh:16  / ls:0
  'label-2':    '35fd36bee1bbc7aa4941a10b048d8e9f7c515603',  // 10 Bold  / lh:12  / ls:0
};

// Font loading map — needed before setting characters
const _fontMap = {
  'heading-1': 'Bold', 'heading-2': 'Bold', 'heading-3': 'Bold',
  'title-1': 'Bold', 'title-2': 'SemiBold',
  'subtitle-1': 'SemiBold', 'subtitle-2': 'SemiBold',
  'body-1': 'Regular', 'body-2': 'Regular',
  'caption-1': 'Regular', 'caption-2': 'Regular',
  'label-1': 'Bold', 'label-2': 'Bold',
};

// Applies the full DS text style (family + size + weight + line height + letter spacing).
async function applyTextStyle(node, styleName) {
  const key = TEXT_STYLE_KEYS[styleName];
  if (!key) throw new Error(`Unknown text style: "${styleName}". Check TEXT_STYLE_KEYS.`);
  const style = await figma.importStyleByKeyAsync(key);
  await node.setTextStyleIdAsync(style.id);
}

// ─── Text Node Factory ────────────────────────────────────────────────────────

// Creates a text node fully connected to the DS:
// - Text style (family, size, weight, line height, letter spacing) via applyTextStyle
// - Fill color via bindColor
// style: heading-1..3 | title-1..2 | subtitle-1..2 | body-1..2 | caption-1..2 | label-1..2
// colorToken: e.g. 'text/default' | 'text/subtle' | 'text/link' etc.
async function createText({ characters, style, colorToken, x, y, width, align }) {
  const figmaStyle = _fontMap[style];
  if (!figmaStyle) throw new Error(`Unknown style: "${style}"`);
  await figma.loadFontAsync({ family: 'Geist', style: figmaStyle });

  const node = figma.createText();
  node.fontName = { family: 'Geist', style: figmaStyle };
  node.characters = characters;
  if (x !== undefined) node.x = x;
  if (y !== undefined) node.y = y;
  if (width !== undefined) { node.textAutoResize = 'HEIGHT'; node.resize(width, node.height); }
  if (align) node.textAlignHorizontal = align;

  await applyTextStyle(node, style);
  await bindColor(node, colorToken);

  return node;
}

// ─── Auto Layout Helpers ──────────────────────────────────────────────────────

// Applies vertical auto layout to a frame.
// gap: spacing between children | padding: {top, bottom, left, right}
function setVerticalAutoLayout(frame, { gap = 0, paddingTop = 0, paddingBottom = 0, paddingLeft = 0, paddingRight = 0 } = {}) {
  frame.layoutMode = 'VERTICAL';
  frame.primaryAxisSizingMode = 'AUTO';   // height hugs content
  frame.counterAxisSizingMode = 'FIXED';  // width is fixed
  frame.primaryAxisAlignItems = 'MIN';
  frame.counterAxisAlignItems = 'MIN';
  frame.itemSpacing = gap;
  frame.paddingTop = paddingTop;
  frame.paddingBottom = paddingBottom;
  frame.paddingLeft = paddingLeft;
  frame.paddingRight = paddingRight;
}

// Applies horizontal auto layout to a frame.
function setHorizontalAutoLayout(frame, { gap = 0, paddingTop = 0, paddingBottom = 0, paddingLeft = 0, paddingRight = 0, align = 'CENTER' } = {}) {
  frame.layoutMode = 'HORIZONTAL';
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'AUTO';
  frame.primaryAxisAlignItems = 'MIN';
  frame.counterAxisAlignItems = align;
  frame.itemSpacing = gap;
  frame.paddingTop = paddingTop;
  frame.paddingBottom = paddingBottom;
  frame.paddingLeft = paddingLeft;
  frame.paddingRight = paddingRight;
}

// Makes a child fill the parent's width (use inside a VERTICAL auto layout parent).
function fillWidth(node) {
  node.layoutSizingHorizontal = 'FILL';
}

// Makes a child hug its content.
function hugContent(node) {
  node.layoutSizingHorizontal = 'HUG';
  node.layoutSizingVertical = 'HUG';
}

// ─── Component Instance Helpers ───────────────────────────────────────────────

// Finds the primary label text node inside a list component instance by exact node name.
// Always use node name, not index, to avoid targeting the wrong text node.
function getListLabel(instance) {
  return instance.findOne(n => n.type === 'TEXT' && n.name === 'List name');
}

// Updates a list item's label text safely (loads font first).
async function setListLabel(instance, text) {
  const labelNode = getListLabel(instance);
  if (!labelNode) throw new Error('List label node not found. Check component structure.');
  await figma.loadFontAsync(labelNode.fontName);
  labelNode.characters = text;
}

// Swaps the action sub-component inside a list item.
// actionKey: use keys from design-components.md → action section
async function setListAction(instance, actionKey) {
  const actionInstance = instance.findOne(n => n.type === 'INSTANCE' && n.name === 'action');
  if (!actionInstance) throw new Error('Action sub-component not found in list item.');
  const actionComp = await figma.importComponentByKeyAsync(actionKey);
  actionInstance.swapComponent(actionComp);
}

// Updates a top-navbar title text safely.
async function setNavbarTitle(instance, title) {
  const titleNode = instance.findOne(n => n.type === 'TEXT' && n.characters === 'Title');
  if (!titleNode) throw new Error('Navbar title node not found.');
  await figma.loadFontAsync(titleNode.fontName);
  titleNode.characters = title;
}
