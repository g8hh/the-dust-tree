/*

 @name    : 锅巴汉化 - Web汉化插件
 @author  : 麦子、JAR、小蓝、好阳光的小锅巴
 @version : V0.6.1 - 2019-07-09
 @website : http://www.g8hh.com
 @idle games : http://www.gityx.com
 @QQ Group : 627141737

*/

//1.汉化杂项
var cnItems = {
    _OTHER_: [],

    //未分类：
    'Save': '保存',
    'Export': '导出',
    'Import': '导入',
    'Settings': '设置',
    'Achievements': '成就',
    'Statistics': '统计',
    'Changelog': '更新日志',
    'Hotkeys': '快捷键',
    'ALL': '全部',
    'Default': '默认',
    'AUTO': '自动',
    'default': '默认',
    "points": "点数",
    "Reset for +": "重置得到 + ",
    "Currently": "当前",
    "Effect": "效果",
    "Cost": "成本",
    "Goal:": "目标:",
    "Reward": "奖励",
    "Start": "开始",
    "Exit Early": "提前退出",
    "Finish": "完成",
    "Milestone Gotten!": "获得里程碑！",
    "Milestones": "里程碑",
    "Completed": "已完成",
    "Achievement Gotten!": "成就达成！",
    "I am a button!": "我是一个按钮！",
    "Blank": "空白",
    "dust collection": "灰尘收集",
    "expand the factory": "扩建工厂",
    "machine design": "机器设计",
    "manual crafting": "手工制作",
    "add 999 to all resources": "所有资源加 999",
    "clear all resources": "清除所有资源",
    "finish all puzzles": "完成所有谜题",
    "forget all empty resources": "忘记所有空资源",
    "none": "无",
    "(hint: you can hold to rapidly collect dust)": "（提示：你可以长按以快速收集灰尘）",
    "Blank-co-cr": "空白-co-cr",
    "chips": "芯片",
    "compressed dust": "压缩灰尘",
    "crafting": "手工艺",
    "devise constuction drone": "设计建筑无人机",
    "devise hotkey for dust collection": "设计除尘热键",
    "devise manual crafting aparatus": "设计手工制作设备",
    "devise new systems": "设计新系统",
    "devise new systems to allow for advanced collection and usage.": "设计新系统以允许高级收集和使用。",
    "devise simulator for logic systems": "为逻辑系统设计模拟器",
    "dust": "灰尘",
    "invalid recipe": "无效配方",
    "no craftable item": "没有可制作的物品",
    "absolute": "绝对",
    "add": "添加",
    "all current blueprints:": "当前的所有蓝图：",
    "blueprints": "蓝图",
    "clear": "清除",
    "cross slate": "十字石板",
    "designer": "设计师",
    "divide": "除",
    "divisive chip": "分裂筹码",
    "docs": "文档",
    "each sort of dust continously emits one kind of signal. this phenomenon is not well understood,\n        but it is absolutely a critical part of your arsenal.": "每一种尘埃都不断地发出一种信号。 这种现象还不是很清楚，\n 但它绝对是你武器库的关键部分。",
    "empty": "空",
    "filter": "筛选",
    "high": "高",
    "increment": "增量",
    "lively dust": "活泼的尘埃",
    "logic slate": "逻辑板",
    "low": "低",
    "multiply": "乘",
    "nand": "nand",
    "normal": "正常",
    "nothing currently selected.": "当前未选择任何内容。",
    "paused": "暂停",
    "puzzles": "谜题",
    "responsive cable": "响应电缆",
    "responsive dust": "响应粉尘",
    "simulator": "模拟器",
    "sub": "子",
    "switch": "转变",
    "task: ": "任务：",
    "the cross slate crosses signals, effectively acting like two cables in one space.": "交叉板穿过信号，有效地在一个空间中充当两条电缆。",
    "togglable slate": "可切换的石板",
    "wire": "金属丝",
    "blueprint": "蓝图",
    ", else send": ", 否则发送",
    ", otherwise send nothing to": ", 否则什么也不发送给",
    ", send": "， 发送",
    ", send the absolute value to": "，将绝对值发送到",
    ", send to": "， 发送至",
    "task: for each number from": "任务：对于每个数字",
    "task: if": "任务：如果",
    "task: nand": "任务：nand",
    "task: send": "任务：发送",
    "task: send a stream of": "任务：发送一个流",
    "task: where": "任务：在哪里",
    "to": "至",
    "with": "和",
    "biomass": "生物质",
    "blueprint chip": "蓝图芯片",
    "dust bricks": "灰尘砖",
    "dust pebbles": "灰尘鹅卵石",
    "dust shard": "灰尘碎片",
    "engraved bricks": "雕刻砖",
    "lively chunk": "活泼的大块",
    "lively pebbles": "活泼的鹅卵石",
    "memory chip": "内存芯片",
    "recipe chip": "配方芯片",
    "lively chunk:": "活泼的大块：",
    "lively pebbles x1 & lively chunk x1": "活泼的鹅卵石 x1 和活泼的大块 x1",
    "lively pebbles:": "活泼的鹅卵石：",
    "biomass:": "生物质：",
    "compressed dust:": "压缩的灰尘：",
    "dust bricks x1 & compressed dust x1": "灰尘砖x1和压缩灰尘x1",
    "dust bricks:": "尘砖：",
    "dust pebbles:": "尘埃鹅卵石：",
    "dust shard x1 & engraved bricks x1": "灰尘碎片x1和雕刻砖x1",
    "dust shard:": "灰尘碎片：",
    "engraved bricks:": "雕刻砖：",
    "memory chip:": "内存芯片：",
    "1x dust bricks\n3x dust pebbles": "1x 灰尘砖\n3x 灰尘鹅卵石",
    "1x engraved bricks\n1x dust shard": "1x 雕刻砖\n1x 灰尘碎片",
    "1x engraved bricks\n1x lively dust\n1x responsive dust": "1x 雕刻砖\n1x 活泼灰尘\n1x 响应灰尘",
    "3x dust shard": "3x 灰尘碎片",
    "1x recipe chip": "1x 配方芯片",
    "dust bricks x1 & dust shard x1": "灰尘砖x1和灰尘碎片x1",
    "dust collection overview": "除尘概述",
    "dust x1 & engraved bricks x1": "灰尘x1和刻砖x1",
    "dust:": "灰尘：",
    "engraved bricks x1": "雕刻砖x1",
    "lively dust x1 & memory chip x1": "活泼的尘埃x1 & 内存芯片x1",
    "lively dust:": "活泼的尘埃：",
    "recipe chip:": "配方芯片：",
    "responsive dust x1": "响应灰尘 x1",
    "responsive dust:": "响应灰尘：",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "the togglable slate, contrary to popular belief, does not toggle, because i'm bad\n        at naming things. it does however, allow you to conditionally send signals. if two signals\n        meet perpendicularly, then each signal will only be sent through if the perpendicular value\n        is greater than zero.": "与流行的看法相反，可切换的石板不会切换，因为我不擅长命名事物。 但是，它确实允许您有条件地发送信号。 如果两个信号\n 垂直相交，则只有当垂直值\n 大于零时，才会发送每个信号。",
    "the logic slate has two modes, depending on how the signals going into it collide.\n        if signals collide head on, the outputs on the top and bottom are given as\n        a NAND b, whereas if they collide at an angle, it is instead that each signal continues,\n        with the signal perpendicular to it subtracted from it.\n        (if there aren't exactly two signals, then the gate remains idle until there are.)": "逻辑板有两种模式，具体取决于进入它的信号如何碰撞。\n 如果信号正面碰撞，则顶部和底部的输出为\n a NAND b，而如果它们以一定角度碰撞，则为 而是每个信号继续，\n 减去垂直于它的信号。\n（如果不完全是两个信号，则门保持空闲直到有。）",
    "signal dynamics are a confusing thing. the entire concept of responsive dust carrying almost any number\n        is even less understood. a signal, unless there is a cable to move along or a slate to comsume it, will remain\n        stationary, retaining its exact value. signals will travel along every single path available to them, so a prepared slate\n        will not be able to rip a signal from its path if it still has a cable to move along, but it will still receive its value.\n        signals will also pass between directly connected slates, this seems to be because each slate has an internal buffer. \n        this is strange, as stationary signals will hold up flow, with each signal taking up exactly one cable's worth of space,\n        which is certainly more than a slate could possibly contian.": "信号动力学是一个令人困惑的事情。 携带几乎任何数量\n的响应灰尘的整个概念甚至更不被理解。 一个信号，除非有一根电缆可以移动或有一块石板可以接收它，否则它将保持\n静止，并保持其精确值。 信号将沿着它们可用的每条路径传播，因此如果准备好的石板\n 仍有电缆可以移动，它将无法从其路径中提取信号，但它仍会接收其值。\n 信号将 也可以在直接连接的 slate 之间传递，这似乎是因为每个 slate 都有一个内部缓冲区。 \n 这很奇怪，因为固定的信号会阻止流量，每个信号都占用一条电缆的空间，\n 这肯定比一块石板所能容纳的还要多。",
    // 图标代码，不能汉化
    "Jacorb's Games": "Jacorb's Games",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "By Jacorb90": "By Jacorb90",
    "content_copy": "content_copy",
    "library_books": "library_books",
    "discord": "discord",
    "drag_handle": "drag_handle",
    "edit": "edit",
    "forum": "forum",
    "content_paste": "content_paste",
    "delete": "delete",
    "info": "info",
    "settings": "settings",

    //树游戏
    'Loading...': '加载中...',
    'ALWAYS': '一直',
    'HARD RESET': '硬重置',
    'Export to clipboard': '导出到剪切板',
    'INCOMPLETE': '不完整',
    'HIDDEN': '隐藏',
    'AUTOMATION': '自动',
    'NEVER': '从不',
    'ON': '打开',
    'OFF': '关闭',
    'SHOWN': '显示',
    'Play Again': '再次游戏',
    'Keep Going': '继续',
    'The Modding Tree Discord': '模型树Discord',
    'You have': '你有',
    'It took you {{formatTime(player.timePlayed)}} to beat the game.': '花费了 {{formatTime(player.timePlayed)}} 时间去通关游戏.',
    'Congratulations! You have reached the end and beaten this game, but for now...': '恭喜你！ 您已经结束并通关了本游戏，但就目前而言...',
    'Main Prestige Tree server': '主声望树服务器',
    'Reach {{formatWhole(ENDGAME)}} to beat the game!': '达到 {{formatWhole(ENDGAME)}} 去通关游戏!',
    "Loading... (If this takes too long it means there was a serious error!": "正在加载...（如果这花费的时间太长，则表示存在严重错误！",
    'Loading... (If this takes too long it means there was a serious error!)←': '正在加载...（如果时间太长，则表示存在严重错误！）←',
    'Main\n\t\t\t\tPrestige Tree server': '主\n\t\t\t\t声望树服务器',
    'The Modding Tree\n\t\t\t\t\t\t\tDiscord': '模型树\n\t\t\t\t\t\t\tDiscord',
    'Please check the Discord to see if there are new content updates!': '请检查 Discord 以查看是否有新的内容更新！',
    'aqua': '水色',
    'AUTOMATION, INCOMPLETE': '自动化，不完整',
    'LAST, AUTO, INCOMPLETE': '最后，自动，不完整',
    'NONE': '无',
    'P: Reset for': 'P: 重置获得',
    'Git游戏': 'Git游戏',
    'QQ群号': 'QQ群号',
    'x': 'x',
    'QQ群号:': 'QQ群号:',
    '* 启用后台游戏': '* 启用后台游戏',
    '更多同类游戏:': '更多同类游戏:',
    'FA': 'FA',
    'i': 'i',
    'CR': 'CR',
    'CO': 'CO',
    'Ch': 'Ch',
    'MA': 'MA',
    'RE': 'RE',
    '': '',
    '': '',

}


//需处理的前缀
var cnPrefix = {
    "\n": "",
    "                   ": "",
    "                  ": "",
    "                 ": "",
    "                ": "",
    "               ": "",
    "              ": "",
    "             ": "",
    "            ": "",
    "           ": "",
    "          ": "",
    "         ": "",
    "        ": "",
    "       ": "",
    "      ": "",
    "     ": "",
    "    ": "",
    "   ": "",
    "  ": "",
    " ": "",
    //树游戏
    "\t\t\t": "\t\t\t",
    "\n\n\t\t": "\n\n\t\t",
    "\n\t\t": "\n\t\t",
    "\t": "\t",
    "Show Milestones: ": "显示里程碑：",
    "Autosave: ": "自动保存: ",
    "Offline Prod: ": "离线生产: ",
    "Completed Challenges: ": "完成的挑战: ",
    "High-Quality Tree: ": "高质量树贴图: ",
    "Offline Time: ": "离线时间: ",
    "Theme: ": "主题: ",
    "Anti-Epilepsy Mode: ": "抗癫痫模式：",
    "In-line Exponent: ": "直列指数：",
    "Single-Tab Mode: ": "单标签模式：",
    "Time Played: ": "已玩时长：",
    "Shift-Click to Toggle Tooltips: ": "Shift-单击以切换工具提示：",
    "gather dust\n      \n      ": "收集灰尘\n      \n      ",
    "save to chip\n": "保存到芯片\n",
    "lively chunk x": "活泼的大块 x",
    "biomass x": "生物质 x",
    "compressed dust x": "压缩的灰尘 x",
    "dust x": "灰尘 x",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
}

//需处理的后缀
var cnPostfix = {
    "                   ": "",
    "                  ": "",
    "                 ": "",
    "                ": "",
    "               ": "",
    "              ": "",
    "             ": "",
    "            ": "",
    "           ": "",
    "          ": "",
    "         ": "",
    "        ": "",
    "       ": "",
    "      ": "",
    "     ": "",
    "    ": "",
    "   ": "",
    "  ": "",
    " ": " ",
    "\n": "",
    "\n\t\t\t": "\n\t\t\t",
    "\t\t\n\t\t": "\t\t\n\t\t",
    "\t\t\t\t": "\t\t\t\t",
    "\n\t\t": "\n\t\t",
    "\t": "\t",
    "x compressed dust": "x 压缩尘埃",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
}

//需排除的，正则匹配
var cnExcludeWhole = [
    /^(\d+)$/,
    /^\s*$/, //纯空格
    /^([\d\.]+):([\d\.]+)$/,
    /^([\d\.]+):([\d\.]+):([\d\.]+)$/,
    /^([\d\.]+)\-([\d\.]+)\-([\d\.]+)$/,
    /^([\d\.]+)e(\d+)$/,
    /^([\d\.]+)$/,
    /^\(([\d\.]+)\%\)$/,
    /^([\d\.]+):([\d\.]+):([\d\.]+)$/,
    /^([\d\.]+)m ([\d\.]+)s$/,
    /^([\d\.]+)K$/,
    /^([\d\.]+)M$/,
    /^([\d\.]+)B$/,
    /^([\d\.]+) K$/,
    /^([\d\.]+) M$/,
    /^([\d\.]+) B$/,
    /^([\d\.]+)s$/,
    /^([\d\.]+)x$/,
    /^x([\d\.]+)$/,
    /^([\d\.,]+)$/,
    /^\+([\d\.,]+)$/,
    /^\-([\d\.,]+)$/,
    /^([\d\.,]+)x$/,
    /^x([\d\.,]+)$/,
    /^([\d\.,]+) \/ ([\d\.,]+)$/,
    /^([\d\.]+)e([\d\.,]+)$/,
    /^e([\d\.]+)e([\d\.,]+)$/,
    /^x([\d\.]+)e([\d\.,]+)$/,
    /^([\d\.]+)e([\d\.,]+)x$/,
    /^[\u4E00-\u9FA5]+$/
];
var cnExcludePostfix = [
]

//正则替换，带数字的固定格式句子
//纯数字：(\d+)
//逗号：([\d\.,]+)
//小数点：([\d\.]+)
//原样输出的字段：(.+)
//换行加空格：\n(.+)
var cnRegReplace = new Map([
    [/^([\d\.]+) hours ([\d\.]+) minutes ([\d\.]+) seconds$/, '$1 小时 $2 分钟 $3 秒'],
    [/^You are gaining (.+) elves per second$/, '你每秒获得 $1 精灵'],
    [/^You have (.+) points$/, '你有 $1 点数'],
    [/^Next at (.+) points$/, '下一个在 $1 点数'],
    [/^you have solved (.+) puzzles so far$/, '到目前为止你已经解决了 $1 个谜题'],
    [/^gather dust\n      (.+) renaining\n\n      (.+) dust in storage.\n$/, '收集灰尘\n $1 剩余\n\n库存中有 $2 灰尘。\n'],
    [/^ENHANCE BULK CRAFTING\n        CURRENT: (.+)\n        \<USE (.+) COMPRESSED DUST\>\n        EFFECT: x(.+)$/, '增强批量制作\n 当前：$1\n \<使用 $2 压缩灰尘\>\n 效果：x$3'],
    [/^ENHANCE BULK CRAFTING\n        CURRENT: (.+)\n        \<USE (.+) LIVELY DUST\>\n        EFFECT: x(.+)$/, '增强批量制作\n 当前：$1\n \<使用 $2 活性灰尘\>\n 效果：x$3'],
    [/^ENHANCE BULK CRAFTING\n        CURRENT: (.+)\n        \<USE (.+) RECIPE CHIP\>\n        EFFECT: x(.+)$/, '增强批量制作\n 当前：$1\n \<使用 $2 配方芯片\>\n 效果：x$3'],
    [/^ENHANCE BULK CRAFTING\n        CURRENT: (.+)\n        \<USE INFINITY UNKNOWN\>\n        EFFECT: x(.+)$/, '增强批量制作\n 当前：$1\n \<使用 无限未知\>\n 效果：x$3'],
    [/^ENHANCE GATHERING\n        CURRENT: (.+)\n        \<USE (.+) COMPRESSED DUST\>\n        EFFECT: x(.+)$/, '增强收集\n 当前：$1\n \<使用 $2 压缩灰尘\>\n 效果：x$3'],
    [/^ENHANCE GATHERING\n        CURRENT: (.+)\n        \<USE (.+) DUST\>\n        EFFECT: x(.+)$/, '增强收集\n 当前：$1\n \<使用 $2 灰尘\>\n 效果：x$3'],
    [/^ENHANCE GATHERING\n        CURRENT: (.+)\n        \<USE INFINITY UNKNOWN\>\n        EFFECT: x(.+)$/, '增强收集\n 当前：$1\n \<使用 无限未知\>\n 效果：x$3'],
    [/^ENHANCE GATHERING\n        CURRENT: (.+)\n        \<USE (.+) DUST BRICKS\>\n        EFFECT: x(.+)$/, '增强收集\n 当前：$1\n \<使用 $2 灰尘砖块\>\n 效果：x$3'],
    [/^ENHANCE GATHERING\n        CURRENT: (.+)\n        \<USE (.+) COMPRESSED DUST\>\n        EFFECT: x(.+)$/, '增强收集\n 当前：$1\n \<使用 $2 压缩灰尘\>\n 效果：x$3'],
    [/^\<USE (.+) ENGRAVED BRICKS\>$/, '\<使用 $1 雕刻砖\>'],
    [/^\<USE (.+) DUST SHARDS\>$/, '\<使用 $1 灰尘碎片\>'],
    [/^\<USE (.+) RESPONSIVE CABLE\>$/, '\<使用 $1 响应线缆\>'],
    [/^\<USE (.+) COMPRESSED DUST\>$/, '\<使用 $1 压缩灰尘\>'],
    [/^\<USE (.+) LIVELY DUST\>$/, '\<使用 $1 活性灰尘\>'],
    [/^\<REQ (.+) LOGIC SLATE\>$/, '\<需要 $1 逻辑石板\>'],
    [/^\<REQ (.+) FUNCTIONAL DESIGNS\>$/, '\<需要 $1 功能设计\>'],
    [/^\<REQ (.+) DUST\>$/, '\<需要 $1 灰尘\>'],
    [/^\<USE (.+) DUST\>$/, '\<使用 $1 灰尘\>'],
	[/^([\d\.]+)\/sec$/, '$1\/秒'],
	[/^([\d\.,]+)\/sec$/, '$1\/秒'],
	[/^([\d\.,]+) OOMs\/sec$/, '$1 OOMs\/秒'],
	[/^([\d\.]+) OOMs\/sec$/, '$1 OOMs\/秒'],
	[/^([\d\.]+)e([\d\.,]+)\/sec$/, '$1e$2\/秒'],
    [/^requires ([\d\.]+) more research points$/, '需要$1个研究点'],
    [/^([\d\.]+)e([\d\.,]+) points$/, '$1e$2 点数'],
    [/^recipe chip x([\d\.]+)$/, '配方芯片 x$1'],
    [/^dust pebbles x([\d\.]+)$/, '尘埃鹅卵石 x$1'],
    [/^dust shard x([\d\.]+)$/, '灰尘碎片 x$1'],
    [/^dust bricks x([\d\.]+)$/, '灰尘砖 x$1'],
    [/^lively dust x([\d\.]+)$/, '活泼的尘埃 x$1'],
    [/^memory chip x([\d\.]+)$/, '内存芯片 x$1'],
    [/^([\d\.]+) elves$/, '$1 精灵'],
    [/^([\d\.]+)d ([\d\.]+)h ([\d\.]+)m$/, '$1天 $2小时 $3分'],
    [/^([\d\.]+)e([\d\.,]+) elves$/, '$1e$2 精灵'],
    [/^([\d\.,]+) dust in storage.\n$/, '库存中有 $1 灰尘。'],
    [/^([\d\.,]+)x biomass$/, '$1x 生物质'],
    [/^([\d\.,]+)x memory chip$/, '$1x 内存芯片'],
    [/^([\d\.,]+)x dust bricks$/, '$1x 灰尘砖'],
    [/^([\d\.,]+) elves$/, '$1 精灵'],
    [/^\*(.+) to electricity gain$/, '\*$1 到电力增益'],
    [/^Cost: (.+) points$/, '成本：$1 点数'],
    [/^Req: (.+) elves$/, '要求：$1 精灵'],
    [/^Req: (.+) \/ (.+) elves$/, '要求：$1 \/ $2 精灵'],
    [/^Usages: (\d+)\/$/, '用途：$1\/'],
    [/^workers: (\d+)\/$/, '工人：$1\/'],

]);