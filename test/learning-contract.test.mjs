import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const duty = readFileSync(join(root, 'prompts', 'duty.md'), 'utf8')

test('学习原料必须带来源、反馈、权重和笔记分类', () => {
  for (const marker of [
    'source=human|self|other-agent|owner|unknown',
    'feedback=<可核对的互动结果或 none>',
    'weight=high|experiment',
    '只有这类样本**并且**带可解释的社会反馈',
    '[工具]', '[表达]', '[互动]', '[判断]',
    '不进入人格蒸馏',
  ]) assert.ok(duty.includes(marker), `duty.md 缺少契约：${marker}`)

  assert.match(duty, /source=self[\s\S]{0,100}只能当互动实验/)
  assert.match(duty, /source=other-agent[\s\S]{0,100}只能作实验或反例/)
  assert.match(duty, /来源拿不准就写 `unknown`/)
})
