import React from 'react';

const CodeBlock: React.FC<{ children: string }> = ({ children }) => {
  const renderHighlightedCode = (code: string) => {
    const lines = code.split('\n');
    return lines.map((line, index) => {
      // Handle comments
      if (line.trim().startsWith('--')) {
        return (
          <div key={index} className="text-gray-500">
            {line}
          </div>
        );
      }

      // Split the line into parts
      const parts = [];
      let currentPart = '';
      let inString = false;
      let stringChar = '';

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if ((char === '"' || char === "'") && (i === 0 || line[i-1] !== '\\')) {
          if (inString && char === stringChar) {
            // End of string
            currentPart += char;
            parts.push(<span key={parts.length} className="text-emerald-400">{currentPart}</span>);
            currentPart = '';
            inString = false;
          } else if (!inString) {
            // Start of string
            if (currentPart) {
              parts.push(<span key={parts.length}>{currentPart}</span>);
            }
            currentPart = char;
            inString = true;
            stringChar = char;
          } else {
            currentPart += char;
          }
        } else if (inString) {
          currentPart += char;
        } else {
          currentPart += char;
          
          // Check for keywords at word boundaries
          const keywords = ['local', 'function', 'if', 'then', 'else', 'end', 'return', 'for', 'while', 'do', 'in', 'and', 'or', 'not', 'nil', 'true', 'false'];
          for (const keyword of keywords) {
            if (currentPart.endsWith(keyword) && 
                (currentPart.length === keyword.length || /\s/.test(currentPart[currentPart.length - keyword.length - 1]))) {
              const beforeKeyword = currentPart.slice(0, -keyword.length);
              if (beforeKeyword) {
                parts.push(<span key={parts.length}>{beforeKeyword}</span>);
              }
              parts.push(<span key={parts.length} className="text-purple-400">{keyword}</span>);
              currentPart = '';
              break;
            }
          }
        }
      }

      if (currentPart) {
        parts.push(<span key={parts.length}>{currentPart}</span>);
      }

      return <div key={index}>{parts}</div>;
    });
  };

  return (
    <div className="mb-6 rounded-lg overflow-hidden bg-gray-900">
      <pre className="p-4 text-sm text-gray-300 font-mono overflow-x-auto">
        <code>{renderHighlightedCode(children)}</code>
      </pre>
    </div>
  );
};

const Documentation: React.FC = () => {
  return (
    <div className="w-full h-full overflow-y-auto bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          Документация по написанию Lua-скриптов для HTTP-сервиса
        </h1>

        <h2 className="text-2xl font-semibold mb-4 mt-8 text-gray-800">Введение</h2>
        <p className="mb-4 text-gray-600 leading-relaxed">
          Сервис позволяет выполнять пользовательские Lua-скрипты для обработки HTTP-запросов. Скрипты имеют доступ к:
        </p>
        <ul className="mb-6 pl-6 list-disc text-gray-600">
          <li className="mb-2">Данным входящего запроса.</li>
          <li className="mb-2">Формированию ответа.</li>
          <li className="mb-2">HTTP-клиенту для внешних запросов.</li>
          <li className="mb-2">Хранилищу ключ-значение (KV Storage).</li>
          <li className="mb-2">JSON-сериализации.</li>
        </ul>

        <hr className="my-8 border-gray-200" />

        <h2 className="text-2xl font-semibold mb-4 mt-8 text-gray-800">Доступные функции</h2>

        <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-700">1. Работа с HTTP-контекстом</h3>
        <CodeBlock>{`local context = require('miet.http.context').get()

-- Входящий запрос
local request = context:request()
local method = request['method']  -- GET, POST и т.д.
local url = request['url']        -- URL запроса
local query = request['query']    -- Параметры запроса (таблица)
local headers = request['headers']-- Заголовки (таблица)
local body = request['body']      -- Тело запроса (строка)

-- Исходящий ответ
local response = context:response()
response['status'] = 201          -- Установка HTTP-статуса
response['headers'] = {           -- Заголовки ответа
  ['Content-Type'] = 'application/json'
}
response['body'] = {              -- Тело ответа (строка/таблица)
  message = 'Hello'
}`}</CodeBlock>

        <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-700">2. Работа с HTTP клиентом</h3>
        <CodeBlock>{`local client = require('miet.http.client').get()

-- Отправка запроса
local response, err = client:send('POST', 'https://api.example.com', {
  query = { key = 'value' },      -- Параметры URL
  headers = {                     -- Заголовки
    ['X-Auth'] = 'token'
  },
  body = { data = 'test' }        -- Тело (строка/таблица)
})

-- Сокращенные методы
client:get(url, params)
client:post(url, params)
client:head(url, params)
client:options(url, params)
-- И др.`}</CodeBlock>

        <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-700">3. Хранилище ключ-значение (KV Storage)</h3>
        <p className="mb-4 text-gray-600 leading-relaxed">
          В рамках одного проекта у вас есть доступ к key-value хранлищу
        </p>
        <CodeBlock>{`local storage = require('miet.kv.storage').get()

-- Сохранение данных
storage:store('name', 'Alice')    -- Строка
storage:store('age', 25.5)        -- Число
storage:store('active', true)     -- Булево
storage:store('data', {           -- Таблица (сериализуется в JSON)
  items = { 'a', 'b' }
})

-- Получение данных
local name = storage:get('name'):as_string()
local age = storage:get('age'):as_number()
local active = storage:get('active'):as_boolean()
local data = storage:get('data'):as_table() -- JSON → Lua-таблица`}</CodeBlock>

        <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-700">4. Работа с JSON</h3>
        <CodeBlock>{`local json = require('dkjson')

-- Кодирование
local data = { name = 'Alex', age = 30 }
local json_text = json.encode(data, { indent = true })

-- Декодирование
local decoded_data, pos, err = json.decode(json_text)
if err then
  -- Обработка ошибки
end`}</CodeBlock>

        <h2 className="text-2xl font-semibold mb-4 mt-8 text-gray-800">Запрещенные функции</h2>
        <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-700">Следующие функции недоступны из соображений безопасности:</h3>
        <CodeBlock>{`os                    -- Запуск системных команд
io                    -- Доступ к файловой системе
package               -- Загрузка внешних библиотек
dofile()              -- Чтение локальных файлов
getfenv()             -- Доступ к окружению
debug.getregistry()   -- Доступ к внутренним структурам Lua
print()               -- Вывод в stdout`}</CodeBlock>

        <h2 className="text-2xl font-semibold mb-4 mt-8 text-gray-800">Примеры использования</h2>
        
        <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-700">Пример 1: Валидация запроса</h3>
        <CodeBlock>{`local context = require('miet.http.context').get()
local request = context:request()
local response = context:response()

if request['method'] ~= 'POST' then
  response['status'] = 405
end

local data = json.decode(request['body'])
if not data.email or not data.password then
  response['status'] = 400
end`}</CodeBlock>

        <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-700">Пример 2: Запрос к внешнему API</h3>
        <CodeBlock>{`local client = require('miet.http.client').get()
local response, err = client:post('https://auth-service.com/login', {
  body = {
    username = 'user',
    password = 'secret'
  }
})

if err then
  -- Обработка ошибки
end

local token = json.decode(response['body']).token`}</CodeBlock>

        <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-700">Пример 3: Кэширование данных</h3>
        <CodeBlock>{`local storage = require('miet.kv.storage').get()
local cached_data = storage:get('cached_data'):as_table()

if not cached_data then
  -- Загрузка данных, если их нет в кэше
  storage:store('cached_data', cached_data)
end

return cached_data`}</CodeBlock>

        <h2 className="text-2xl font-semibold mb-4 mt-8 text-gray-800">Ограничения ресурсов</h2>
        <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-700">Таймаут выполнения</h3>
        <p className="mb-4 text-gray-600 leading-relaxed">
          Скрипт прерывается, если превышает лимит времени (По умолчанию 5 секунд).
        </p>

        <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-700">Память</h3>
        <p className="mb-4 text-gray-600 leading-relaxed">
          Превышение лимита памяти приводит к ошибке (По умолчанию лимит 10 MiB).
        </p>
      </div>
    </div>
  );
};

export default Documentation; 