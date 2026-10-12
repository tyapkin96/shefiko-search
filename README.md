# shefiko-search

Автоматический индекс товаров для умного поиска на shefiko.ru.

- `scripts/build_index.py` берёт каталог с публичного API магазина Tilda и собирает `docs/index.json`.
- `.github/workflows/build.yml` запускает сборку каждые 6 часов (и вручную: Actions → Run workflow).
- `docs/` публикуется через GitHub Pages: `https://tyapkin96.github.io/shefiko-search/index.json`.
- Если собрано заметно меньше товаров, чем раньше, старый файл не перезаписывается (см. `docs/status.json`).

Секретов в репозитории нет.

## Что на сайте
- `site/search-engine.js` — код умного поиска (его копия лежит в блоке T123 в футере сайта Tilda).
- `site/search-theme.css` — оформление (чёрный на главной, белый на остальных страницах).
- Порядок загрузки данных: сначала `index.json` с GitHub Pages; если он недоступен, встроенный снимок каталога в блоках футера; если и его нет, работает обычный поиск Tilda.
