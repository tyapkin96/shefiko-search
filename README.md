# shefiko-search

Автоматический индекс товаров для умного поиска на shefiko.ru.

- `scripts/build_index.py` берёт каталог с публичного API магазина Tilda и собирает `docs/index.json`.
- `.github/workflows/build.yml` запускает сборку каждые 6 часов (и вручную: Actions → Run workflow).
- `docs/` публикуется через GitHub Pages: `https://tyapkin96.github.io/shefiko-search/index.json`.
- Если собрано заметно меньше товаров, чем раньше, старый файл не перезаписывается (см. `docs/status.json`).

Секретов в репозитории нет.
