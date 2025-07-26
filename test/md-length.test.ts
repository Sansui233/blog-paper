import { mdLength } from '../lib/markdown/md-length';

describe('mdLength', () => {
  it('图片只计 alt', () => {
    expect(mdLength('![猫](cat.jpg)')).toBe(1);
    expect(mdLength('![可爱猫咪](cat.jpg)')).toBe(4);
  });

  it('链接只计 text', () => {
    expect(mdLength('[百度](https://baidu.com)')).toBe(2);
  });

  it('代码块只计内容', () => {
    expect(mdLength('```\nhello world\n```')).toBe(11);
  });

  it('强调只计内容', () => {
    expect(mdLength('**加粗** *斜体*')).toBe(5);
  });

  it('行内代码只计内容', () => {
    expect(mdLength('`code`')).toBe(4);
  });

  it('HTML 标签只计内容', () => {
    expect(mdLength('<span>你好</span>')).toBe(2);
  });

  it.only('注释不计入', () => {
    expect(mdLength('hello <!-- comment --> world')).toBe(11);
  });

  it('表格只计内容', () => {
    expect(mdLength('| 姓名 | 年龄 |\n| --- | --- |\n| 张三 | 18 |')).toBe(8);
  });

  it('分割线不计入', () => {
    expect(mdLength('---\nhello\n***')).toBe(5);
  });

  it('任务列表只计内容', () => {
    expect(mdLength('- [ ] 任务一\n- [x] 任务二')).toBe(6);
  });

  it('引用只计内容', () => {
    expect(mdLength('> 引用内容')).toBe(4);
  });

  it('混合内容', () => {
    expect(mdLength('**[百度](https://baidu.com)** 和 ![猫](cat.jpg)')).toBe(6);
  });

  it('mdx 组件不计入', () => {
    expect(mdLength('<MyComponent prop="1" />hello')).toBe(5);
  });
});