# Geely Weather Proxy v2.0 — белорусские города + CN→RU перевод

Vercel serverless proxy для штатного приложения погоды Geely Galaxy E8 (E171).
Добавляет 20 белорусских городов (Open-Meteo) и **переводит все китайские данные на русский**.

## Что нового в v2.0

- **CN→RU перевод** — все проксированные ответы Geely API автоматически переводятся
  (погодные явления, направления ветра). Модуль `lib/translate.js`.
- **Русские имена городов** — `nameCN` для BY городов содержит русские названия
  (Минск, Брест…), поэтому локальный поиск в приложении работает на русском.
- **maxDuration: 30** в vercel.json для надёжности проксирования.

## v4.1.0 — добавление города из поиска

`/climate/cityList` раньше всегда отдавал один и тот же список из 3 городов,
поэтому после добавления города через поиск (`/climate/bindcity`) карточка
не появлялась — следующий запрос списка перезаписывал её обратно. Теперь
`lib/bound-cities.js` хранит добавленные/удалённые города в памяти процесса и
`/climate/cityList` отдаёт актуальный список. Ограничение: это не персистентное
хранилище — состояние сбрасывается при холодном старте функции на Vercel.

## Архитектура

```
Магнитола (com.geely.service.cloud)
    │  persist.geely.weather.proxy = https://<project>.vercel.app
    ▼
Vercel (этот репозиторий)
    ├── areaId BY_xx → Open-Meteo API (бесплатно, без ключа, русский)
    └── остальные    → прокси на oneoss-ecu.geely.com + CN→RU перевод
```

## Файлы

| Файл               | Назначение                                       |
| ------------------ | ------------------------------------------------ |
| `api/index.js`     | Vercel serverless handler — роутинг запросов     |
| `lib/cities.js`    | 20 белорусских городов (русские имена в nameCN)  |
| `lib/openmeteo.js` | Open-Meteo API → формат Geely WeatherInfo        |
| `lib/translate.js` | CN→RU словари + рекурсивный перевод JSON-ответов |
| `vercel.json`      | Rewrites + maxDuration                           |

## Деплой на Vercel

1. Пуш в GitHub
2. [vercel.com/new](https://vercel.com/new) → Import → выбрать репозиторий
3. Framework: **Other**, Build: пусто, Output: пусто
4. Deploy → получить URL вида `https://geely-weather-proxy.vercel.app`

## Подключение магнитолы

```bash
# Установить Magisk-модуль (один раз, из репозитория platform-tools)
node car-mods/scripts/install-module.js --dir car-mods/modules/com_geely_service_cloud --reboot

# Указать прокси
adb shell su -c "setprop persist.geely.weather.proxy https://geely-weather-proxy.vercel.app"

# Перезапустить облачный сервис
adb shell su -c "am force-stop com.geely.service.cloud"

# Установить мод погоды (русские табы, arrays.xml, layout)
node car-mods/scripts/install-mod.js --package com.geely.weather
```

## Города (20, русские названия)

Минск, Брест, Гродно, Витебск, Могилёв, Гомель, Барановичи, Бобруйск,
Борисов, Пинск, Орша, Мозырь, Солигорск, Новополоцк, Лида, Молодечно,
Полоцк, Жлобин, Речица, Слуцк.

## Переменные окружения (опционально)

| Переменная       | По умолчанию                   | Описание                   |
| ---------------- | ------------------------------ | -------------------------- |
| `GEELY_UPSTREAM` | `https://oneoss-ecu.geely.com` | Апстрим для не-BY запросов |

## Локальная проверка

```bash
npx vercel dev
curl "http://localhost:3000/geely/znzc/oneos/climate/current?areaId=BY_01"
curl "http://localhost:3000/geely/znzc/oneos/climate/citys?page=1"
```

## Откат

```bash
adb shell su -c "setprop persist.geely.weather.proxy https://oneoss-ecu.geely.com"
adb shell su -c "am force-stop com.geely.service.cloud"
```
