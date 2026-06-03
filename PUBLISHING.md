# Публикация a11y-react-kit на npm

---

## Шаг 1 — Вынести в отдельную папку

Скопируй папку пакета в новое место (вне текущего проекта):

```bash
cp -r /Users/{{USER}}/NewsMaximum/packages/a11y-react-kit \
      /Users/{{USER}}/a11y-react-kit
cd /Users/{{USER}}/Documents/a11y-react-kit
```

---

## Шаг 2 — Заполнить author в package.json

Открой `package.json` и заполни поле `author`:

```json
"author": "Roman Nefedov <your@email.com>"
```

Поля `repository` и `homepage` заполнишь на шаге 4 после создания репо.

---

## Шаг 3 — Инициализировать git-репозиторий

```bash
git init
git add .
git commit -m "initial release: a11y-react-kit v1.0.0"
```

---

## Шаг 4 — Создать репозиторий на GitHub

1. Зайди на https://github.com/new
2. Название: `a11y-react-kit`
3. Описание: `Accessibility panel + TTS hooks for React`
4. Visibility: Public *(обязательно для бесплатного npm)*
5. **Не добавляй** README, .gitignore и LICENSE — они уже есть
6. Нажми **Create repository**

Затем привяжи локальный репо к GitHub и запушь:

```bash
git remote add origin https://github.com/ВАШ_ЮЗЕРНЕЙМ/a11y-react-kit.git
git branch -M main
git push -u origin main
```

После этого вернись в `package.json` и заполни поля:

```json
"repository": {
  "type": "git",
  "url": "https://github.com/ВАШ_ЮЗЕРНЕЙМ/a11y-react-kit.git"
},
"homepage": "https://github.com/ВАШ_ЮЗЕРНЕЙМ/a11y-react-kit#readme"
```

Закоммить изменение:

```bash
git add package.json
git commit -m "add repository links"
git push
```

---

## Шаг 5 — Проверить, не занято ли имя на npm

```bash
npm view a11y-react-kit
```

- Если выдаёт ошибку `404` — имя свободно, продолжай.
- Если выдаёт информацию о чужом пакете — нужно придумать другое имя
  (например, `@ВАШ_ЮЗЕРНЕЙМ/a11y-react-kit` — scope-пакет, всегда уникален).

### Если выбрал scope-пакет

Поменяй `name` в `package.json`:

```json
"name": "@ВАШ_ЮЗЕРНЕЙМ/a11y-react-kit"
```

И при публикации используй флаг `--access public` (шаг 7).

---

## Шаг 6 — Зарегистрироваться / войти в npm

Если аккаунта нет — зарегистрируйся на https://www.npmjs.com/signup

```bash
npm login
```

Введёт запросит:
- Username
- Password
- Email
- Одноразовый код (придёт на почту)

Проверить, что вошёл:

```bash
npm whoami
# должен вывести твой username
```

---

## Шаг 7 — Собрать и опубликовать

Скрипт `prepublishOnly` запустит сборку автоматически:

```bash
npm publish
# Если scope-пакет (@username/...):
npm publish --access public
```

После успеха пакет будет доступен на:
```
https://www.npmjs.com/package/a11y-react-kit
```

---

## Шаг 8 — Перейти с file: на npm-зависимость в основном проекте

В `/Users/{{USER}}/Documents/NewsMaximum/frontend/package.json` замени:

```json
"a11y-react-kit": "file:../packages/a11y-react-kit"
```

на:

```json
"a11y-react-kit": "^1.0.0"
```

Потом:

```bash
docker exec nsi_frontend sh -c "cd /app && npm install"
```

---

## Публикация новых версий

Каждый раз когда вносишь изменения:

```bash
# Исправление бага — 1.0.0 → 1.0.1
npm version patch

# Новая функция без ломки — 1.0.0 → 1.1.0
npm version minor

# Ломающее изменение — 1.0.0 → 2.0.0
npm version major
```

Эти команды сами обновят `version` в `package.json` и создадут git-тег.

```bash
git push --follow-tags
npm publish
```

---

## Итоговая структура репозитория

```
a11y-react-kit/
├── src/
│   ├── types.ts              — TypeScript интерфейсы
│   ├── context.tsx           — A11yProvider + useA11y()
│   ├── useTTS.ts             — useTTS(), preprocessTTSText(), stripHtmlForTTS()
│   ├── AccessibilityPanel.tsx— готовый компонент (без Tailwind)
│   ├── styles.css            — глобальные CSS-классы (rak-*)
│   └── index.ts              — публичный API
├── dist/                     — сгенерированный при публикации (в git не попадает)
├── .gitignore
├── LICENSE
├── README.md
├── package.json
├── tsconfig.json
└── tsup.config.ts
```
