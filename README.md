# Geely Weather Proxy — белорусские города

Vercel serverless proxy, добавляющий 20 белорусских городов в штатное приложение
погоды Geely Galaxy E8 (E171). Работает в паре с Magisk-модулем
`com_geely_service_cloud` из репозитория `platform-tools`.

## Архитектура

```
Магнитола (com.geely.service.cloud)
    │  persist.geely.weather.proxy = https://<project>.vercel.app
    ▼
Vercel (этот репозиторий)
    ├── areaId BY_xx → Open-Meteo API (бесплатно, без ключа)
    └── остальные    → прокси на oneoss-ecu.geely.com
```

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
```

## Города

Минск, Брест, Гродно, Витебск, Могилёв, Гомель, Барановичи, Бобруйск,
Борисов, Пинск, Орша, Мозырь, Солигорск, Новополоцк, Лида, Молодечно,
Полоцк, Жлобин, Речица, Слуцк.

## Переменные окружения (опционально)

| Переменная | По умолчанию | Описание |
|---|---|---|
| `GEELY_UPSTREAM` | `https://oneoss-ecu.geely.com` | Апстрим для не-BY запросов |

## Локальная проверка

```bash
npx vercel dev
curl "http://localhost:3000/geely/znzc/oneos/climate/current?areaId=BY_01"
```

## Откат

```bash
adb shell su -c "setprop persist.geely.weather.proxy https://oneoss-ecu.geely.com"
```
