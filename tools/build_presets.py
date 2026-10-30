import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
# Base layout these presets describe: ANSI 60%, split right shift, 6.25U bottom row (8 keys).
IDS = [
 ['esc','1','2','3','4','5','6','7','8','9','0','minus','equal','bksp'],
 ['tab','q','w','e','r','t','y','u','i','o','p','lbr','rbr','bslash'],
 ['caps','a','s','d','f','g','h','j','k','l','semi','quote','enter'],
 ['lshift','z','x','c','v','b','n','m','comma','dot','slash','rshift','fn'],
 ['lctrl','lsuper','lalt','space','ralt','rsuper','rfn','rctrl']]
W4 = [1.25,1.25,1.25,6.25,1.25,1.25,1.25,1.25]
MODS = {'esc','bksp','tab','bslash','caps','enter','lshift','rshift','fn','lctrl','lsuper','lalt','ralt','rsuper','rfn','rctrl'}
def build(alpha, mod, space=None, esc=None, enter=None, over=None):
    """alpha/mod/space/esc/enter: [cap, legend]; over: {key id or comma list: [cap, legend] or {'leg': c}}"""
    over = over or {}
    expanded = {}
    for k, v in over.items():
        for kk in k.split(','): expanded[kk.strip()] = v
    rows = []
    for row in IDS:
        out = []
        for k in row:
            c = list(space or alpha) if k == 'space' else list(esc or mod) if k == 'esc' else list(enter or mod) if k == 'enter' else list(mod) if k in MODS else list(alpha)
            o = expanded.get(k)
            if isinstance(o, dict): c[1] = o['leg']
            elif o: c = list(o)
            out.append(c)
        rows.append(out)
    return rows
W = '#ffffff'; K = '#1c1c1d'
Y = '#f4f43c'; PU = '#4a2a80'; LG = '#c4c7cb'; DG = '#727275'
GMK = [
 ('wob3','GMK WoB','gmk-text', {}, build(['#262627',W], ['#1e1e1f',W], space=['#1e1e1f',W])),
 ('mut2','GMK Mut','gmk-icon', {}, build(['#f6f6f8',K], ['#bdbbbf',K], space=['#f4f4f6',K])),
 ('dolch','GMK Dolch','gmk-text', {}, build(['#6f6e6a',W], ['#3f4042',W], space=['#6f6e6a',W])),
 ('beige4','GMK Beige','gmk-text', {}, build(['#f6f0e9',K], ['#bdb8ab',K], space=['#f4eee7',K])),
 ('hybeige','GMK Hyperbeige','gmk-text', {}, build(['#f6f0e9','#6e3a92'], ['#bdb8ab','#3fd9c4'], space=['#f4eee7',K], esc=['#5eeedb','#6b3c90'], enter=['#5eeedb','#6b3c90'])),
 ('nervew','GMK Nervewrecker','gmk-icon', {}, build([LG,PU], [DG,Y], space=['#4a287f',Y], esc=['#4a287f',Y], enter=[LG,PU], over={
     '1,2,3,4,5,6,7,8,9,0': [Y,PU], 'minus,equal': ['#4a287f',Y], 'bksp': [Y,PU], 'tab,caps': ['#4a287f',Y],
     'y,u,i,o,p,h,j,k,l,b,n,m': [DG,Y], 'lbr,rbr,semi,quote,comma,dot,slash': ['#4a287f',Y], 'bslash,rshift': [LG,PU],
     'lshift,fn': [DG,Y], 'lctrl,rsuper': [LG,PU], 'lsuper,ralt': [Y,PU], 'lalt': [DG,Y], 'rctrl': ['#4a287f',Y], 'rfn': [LG,PU]})),
 ('nerve2','GMK Nerve','gmk-icon', {}, build(['#e1e4e8',PU], ['#6f6f72',Y], space=['#dadee1',PU], esc=['#2a1a44',Y], enter=['#4a267f',Y])),
 ('taiga','GMK Taiga','cyrillic', {}, build(['#29615c',W], ['#22393a',W], space=['#24584f',W])),
 ('ramune2','GMK Ramune','kana', {}, build(['#f6f6f9','#1d4fa0'], ['#c6e2fa','#3a6cc0'], space=['#f6f6f9',K], esc=['#3d73d0',W], enter=['#2b6aca',W])),
 ('evild','GMK Evil Dolch','gmk-text', {}, build(['#4a4b4d',W], ['#252526','#b22a37'], space=['#3c3d3e',W], esc=['#2a1d24','#c4303c'])),
 ('finer','GMK Finer Things','gmk-plain', {'enter': {'text': 'Return'}}, build(['#5ee2d7',W], ['#5ee2d7',W])),
 ('dualshot2','GMK Dualshot','gmk-text', {'super': {'text': 'Code'}}, build(['#909195','#303133'], ['#a3a4a7','#4a4b4d'], space=['#3098d3','#303133'], esc=['#e8393d','#303133'], enter=['#32cbd3','#303133'], over={
     'bksp': ['#e8393d','#303133'], 'tab,bslash': ['#ffc040','#303133'], 'caps': ['#32cbd3','#303133'], 'lshift,rshift,fn': ['#3098d3','#303133']})),
 ('crimson','GMK Crimson Cadet','gmk-text', {'enter': {'text': 'Return'}, 'caps': {'icon': 'caps', 'text': '', 'at': 'mid'}}, build(['#d93737',W], ['#d43333',W])),
 ('stallion2','GMK Stallion','gmk-icon', {}, build(['#e7e3de','#a9a6a1'], ['#8d8a85',W], space=['#e4e0db','#a9a6a1'], esc=['#4f4c4b',W], enter=['#3f3c3a',W], over={
     'lctrl,rctrl': ['#5c5956',W], 'lsuper,rsuper': ['#c4c0ba','#4f4c4b']})),
 ('chladni','GMK Chladni','gmk-icon', {}, build(['#463033','#fff3d8'], ['#3f2a2d','#fff3d8'])),
 ('burgundy','GMK Burgundy','gmk-icon', {}, build(['#8c3640',W], ['#3d3e40',W], space=['#86303a',W])),
 ('ishtar','GMK Ishtar','gmk-icon', {}, build(['#f1e5d2','#e01025'], ['#2a2a2c','#e01025'], space=['#efe3d0','#e01025'], esc=['#f8a64c','#e01025'], enter=['#f8a64c','#e01025'])),
 ('viz','GMK Hi Viz','gmk-icon', {}, build(['#f2fd36','#858585'], ['#f2fd36','#858585'])),
 ('flare2','GMK Flare','gmk-icon', {}, build(['#ff4f3c','#1a1a1a'], ['#ff4f3c','#1a1a1a'])),
 ('varanye','GMK Varanye','cyrillic', {}, build(['#6b2e37',W], ['#6b2e37',W], space=['#68293a',W])),  # alt mods in the alpha colour
]
CADET = {'Q':'∧','W':'∨','E':'∩','R':'∪','T':'⊂','Y':'⊃','U':'∀','I':'∞','O':'∃','P':'∂','A':'⊥','S':'⊤','D':'⊢','F':'⊣','G':'↑','H':'↓','J':'←','K':'→','L':'↔','Z':'⌊','X':'⌈','C':'≠','V':'≃','B':'≡','N':'≤','M':'≥'}
# SWG Rainbow Alert: every key has its own legend colour (rainbow cycle), sampled from the render
rl = json.load(open(ROOT / 'tools/data/rainbow-legends.json'))
PURPLE = '#5b4aa6'
rl = [[PURPLE if c == '#3a3a3a' else c for c in row] for row in rl]
rl[4][4] = '#728949'   # right Alt is green in the render
rb = build(['#ece6d8', K], ['#bdb5a2', K], space=['#ece6d8', K])
for r, row in enumerate(rb):
    for i, c in enumerate(row):
        if IDS[r][i] != 'space': c[1] = rl[r][i] if i < len(rl[r]) else c[1]
SWG = [
 ('classic-blue','SWG Classic Blue','gmk-text', {}, build(['#eeedea','#1f4c9a'], ['#1f4c9a',W])),
 ('classic-red','SWG Classic Red','gmk-text', {}, build(['#eeedea','#c02a2a'], ['#c02a2a',W])),
 ('space-cadet','SWG Space Cadet','gmk-text', {}, build(['#4a4d52',W], ['#2a6aa4',W], space=['#4a4d52',W])),
 ('crimson-cadet','SWG Crimson Cadet','gmk-text', {}, build(['#c4302b',W], ['#c4302b',W])),
 ('forest-cadet','SWG Forest Cadet','gmk-text', {}, build(['#2d5a40',W], ['#2d5a40',W])),
 ('rainbow-alert','SWG Rainbow Alert','gmk-text', {}, rb),
 ('ferrofluid','SWG Ferrofluid','gmk-text', {}, build(['#c4c4c6','#4636c8'], ['#3b2be0',W], esc=['#3b2be0',W], enter=['#e23ccf',W])),  # alt mods in the blue
 ('rubber','SWG Rubber','gmk-text', {}, build(['#2f2f30','#e3dccb'], ['#d9d5cb','#2b2b2b'], space=['#2f2f30','#e3dccb'])),
 ('nightshift','SWG Nightshift','gmk-text', {}, build(['#2b2e33','#e4f22a'], ['#2b2e33','#e4f22a'], space=['#2b2e33','#e4f22a'])),  # alien alphas + alt mods: all caps dark, yellow legends
 ('prepress','SWG Prepress','gmk-text', {}, build(['#c9c7c2','#222222'], ['#2b2b2d',W], space=['#e04aa8',W], esc=['#1ea5d8',W], enter=['#efe62a','#222222'])),
 ('euler','SWG Euler','gmk-text', {}, build(['#3a3d42',W], ['#1f2124',W])),
 ('skeletoon','SWG Skeletoon','gmk-text', {}, build(['#4d4945','#ece9e4'], ['#4d4945','#ece9e4'])),  # one colour throughout
 ('beige','SWG Beige','gmk-text', {}, build(['#f0ece3','#2c2c2c'], ['#b7b2a4','#2c2c2c'])),
]
# Sets that also come with an alt mods kit: base build (keys) plus alt build (altKeys); previews open on alt.
ALT_BASE = {
 'gmk-varanye': build(['#6b2e37',W], ['#3b3031',W], space=['#68293a',W]),
 'swg-ferrofluid': build(['#c4c4c6','#4636c8'], ['#66666b',W], esc=['#3b2be0',W], enter=['#e23ccf',W]),
 'swg-nightshift': build(['#2b2e33','#e4f22a'], ['#a4a6a8','#2b2b2b'], space=['#2b2e33','#e4f22a'], esc=['#e4f22a','#2b2b2b'], enter=['#e4f22a','#2b2b2b']),
}
presets = []
for i, n, st, mods, keys in GMK:
    p = {'id': 'gmk-' + i, 'name': n, 'brand': 'GMK', 'legends': st, 'keys': keys, 'w4': W4}
    if mods: p['mods'] = mods
    if i == 'crimson': p['subs'] = CADET; p['subColor'] = W
    presets.append(p)
for i, n, st, mods, keys in SWG:
    p = {'id': 'swg-' + i, 'name': n, 'brand': 'SWG', 'legends': st, 'keys': keys, 'w4': W4}
    if i == 'rubber': p['sub'] = 'cyrillic'; p['subColor'] = '#d8383a'
    if i == 'nightshift': p['alien'] = True
    if i == 'crimson-cadet' or i == 'space-cadet' or i == 'forest-cadet': p['subs'] = CADET
    presets.append(p)
for p in presets:
    if p['id'] in ALT_BASE:
        p['altKeys'] = p['keys']; p['keys'] = ALT_BASE[p['id']]; p['altDefault'] = True
HEAD = ("/* Famous keycap sets for the preview-only picker in the Pangea configurator.\n"
        " * Each set: cap and legend colour per key for ANSI 60% / split shift / 6.25U (keys), defined by role\n"
        " * (alphas, modifiers, Esc, Enter, spacebar) with per-key overrides, checked against top-down renders.\n"
        " * legends: gmk-text, gmk-icon, cyrillic, kana; mods: label overrides; subs/sub: sub-legends. Preview only.\n"
        " * Generated by tools/build_presets.py. */\n")
(ROOT / 'assets/pangea-keycap-presets.js').write_text(HEAD + 'window.PangeaPresets = ' + json.dumps(presets, separators=(',', ':'), ensure_ascii=False) + ';\n', encoding='utf-8')
print(len(presets), 'presets written to assets/pangea-keycap-presets.js')
