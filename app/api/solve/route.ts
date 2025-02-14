import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';

// Определяем классы (по примеру вашего кода)
class FirstFc {
  private a: number;
  private b: number;
  private c: number;

  constructor(a: number, b: number, c: number) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

  solve(): number {
    const { a, b, c } = this;
    if (a === 0 || b === 0 || c === 0) return NaN;

    let result = (((a / b) + (b / a)) * ((a / c) + (c / a))) / (a + b + c);
    return isFinite(result) ? result : NaN;
  }
}

class SecondFc {
  private m: number;
  private d: number;
  private i: number;

  constructor(m: number, d: number, i: number) {
    this.m = m;
    this.d = d;
    this.i = i;
  }

  solve(): number {
    const { m, d, i } = this;
    if (d === 0 || i === 0) return NaN;

    let result: number;
    if (i % 2 === 0) {
      result = (d * m ** 5 - d ** 5 * m) / (i * d);
    } else {
      result = (i * d) / (d * m ** 3 - d ** 3 * m);
    }

    return isFinite(result) ? result : NaN;
  }
}

class ThirdFc {
  private n: number;
  private c: number;

  constructor(n: number, c: number) {
    this.n = n;
    this.c = c;
  }

  solve(): number {
    const { n, c } = this;
    let result: number = 0;
    let f: number = 1;

    for (let a = 0; a <= n; a++) {
      let sum: number = (a ** 2 + 56 * c ** a * f);
      result += sum;
    }

    return isFinite(result) ? result : NaN;
  }
}

// API-обработчик с внедрением чтения и записи в файл
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, params, fileName, content, action } = body;

    if (!type || !params) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let result: number;

    // Логика обработки типов функций
    switch (type) {
      case 'FirstFc':
        if (params.a === undefined || params.b === undefined || params.c === undefined) {
          return NextResponse.json({ error: 'Missing parameters for FirstFc' }, { status: 400 });
        }
        result = new FirstFc(params.a, params.b, params.c).solve();
        break;
      case 'SecondFc':
        if (params.m === undefined || params.d === undefined || params.i === undefined) {
          return NextResponse.json({ error: 'Missing parameters for SecondFc' }, { status: 400 });
        }
        result = new SecondFc(params.m, params.d, params.i).solve();
        break;
      case 'ThirdFc':
        if (params.n === undefined || params.c === undefined) {
          return NextResponse.json({ error: 'Missing parameters for ThirdFc' }, { status: 400 });
        }
        result = new ThirdFc(params.n, params.c).solve();
        break;
      default:
        return NextResponse.json({ error: 'Invalid function type' }, { status: 400 });
    }

    if (isNaN(result)) {
      return NextResponse.json({ error: 'Invalid data: result is NaN' }, { status: 400 });
    }

    // Если указано действие с файлом, выполняем чтение или запись
    if (action === 'read') {
      if (!fileName) {
        return NextResponse.json({ error: 'Missing fileName for read action' }, { status: 400 });
      }
      try {
        const fileContent = await fs.readFile(fileName, 'utf-8');
        return NextResponse.json({ result, fileContent });
      } catch (err) {
        return NextResponse.json({ error: 'Error reading the file' }, { status: 500 });
      }
    }

    if (action === 'write') {
      if (!fileName || !content) {
        return NextResponse.json({ error: 'Missing fileName or content for write action' }, { status: 400 });
      }
      try {
        await fs.writeFile(fileName, content, 'utf-8');
        return NextResponse.json({ result, message: 'File written successfully' });
      } catch (err) {
        return NextResponse.json({ error: 'Error writing to the file' }, { status: 500 });
      }
    }

    // Возвращаем результат вычислений
    return NextResponse.json({ result });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
