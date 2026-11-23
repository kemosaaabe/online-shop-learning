import { useState } from 'react';
import type { FormEvent } from 'react';

import { createProductPath } from './constants';
import type { CreateProductPayload, CreateProductResult } from './types';

import styles from './CreateProductPage.module.css';

function formatResponse(body: string): string {
  try {
    const json: unknown = JSON.parse(body);

    return JSON.stringify(json, null, 2);
  } catch {
    return body;
  }
}

export function CreateProductPage() {
  const [requestBody, setRequestBody] = useState('');
  const [result, setResult] = useState<CreateProductResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fields = new FormData(event.currentTarget);
    const description = String(fields.get('description') ?? '').trim();
    const stock = String(fields.get('stock') ?? '');
    const product: CreateProductPayload = {
      name: String(fields.get('name') ?? '').trim(),
      price: String(fields.get('price') ?? '').trim().replace(',', '.'),
      categoryId: Number(fields.get('categoryId')),
    };

    if (description) {
      product.description = description;
    }

    if (stock !== '') {
      product.stock = Number(stock);
    }

    const body = JSON.stringify(product, null, 2);
    setRequestBody(body);
    setResult(null);
    setSubmitting(true);

    try {
      const response = await fetch(createProductPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      const responseBody = await response.text();
      let message = 'Получен ответ API';

      if (!response.ok) {
        message = 'Сервер отклонил запрос';
      } else if (!responseBody) {
        message = 'Сервер вернул пустой ответ';
      }

      setResult({ status: response.status, body: formatResponse(responseBody), message });
    } catch {
      setResult({ message: 'Не удалось получить ответ API' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <h1>Создание товара</h1>
        <code>POST {createProductPath}</code>
      </header>

      <div className={styles.workspace}>
        <form className={styles.form} onSubmit={submitProduct}>
          <label>
            Название
            <input name="name" required />
          </label>
          <label>
            Описание <small>необязательно</small>
            <textarea name="description" rows={3} />
          </label>
          <div className={styles.pair}>
            <div>
              <label htmlFor="product-price">Цена</label>
              <input id="product-price" name="price" inputMode="decimal" aria-describedby="price-help" required />
              <small id="price-help">До двух знаков после запятой</small>
            </div>
            <div>
              <label htmlFor="product-stock">Остаток</label>
              <input id="product-stock" name="stock" type="number" min={0} step={1} aria-describedby="stock-help" />
              <small id="stock-help">По умолчанию 0</small>
            </div>
          </div>
          <label>
            ID категории
            <input name="categoryId" type="number" min={1} step={1} required />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Отправка…' : 'Создать товар'}
          </button>
        </form>

        <aside className={styles.api} aria-label="Отладка API">
          <section>
            <h2>Тело запроса</h2>
            {requestBody ? <pre>{requestBody}</pre> : <p>Появится после отправки формы.</p>}
          </section>
          <section aria-live="polite">
            <div className={styles.responseHeading}>
              <h2>Ответ API</h2>
              {result?.status !== undefined && <code>HTTP {result.status}</code>}
            </div>
            {submitting && <p>Ожидаем ответ…</p>}
            {result && <p>{result.message}</p>}
            {result?.body && <pre>{result.body}</pre>}
          </section>
        </aside>
      </div>
    </main>
  );
}
