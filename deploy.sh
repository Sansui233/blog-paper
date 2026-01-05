#!/bin/bash
# 此脚本由 chatgpt-3.5 生成

TARGETDIR="/c/Users/lingn/git/Sansui233.github.io" # 替换为你的目标目录路径

# 删除target directory中除了 .git 和 .gitignore 的所有文件
shopt -s extglob
rm -r "$TARGETDIR"/!(".git"|".gitignore")

# 将当前目录下的out文件夹中的所有文件复制到target directory
cp -r build/client/* "$TARGETDIR"/

# 进入target directory
cd "$TARGETDIR"

# 添加所有更改到暂存区
git add .

# 获取当前时间作为默认的commit message
curr_time="$(date +"%Y-%m-%d %H:%M:%S")"

# 提交更改
git commit -m "Updated at $curr_time"

git push origin master # 分支名称根据实际情况修改

# 返回原始目录
cd -