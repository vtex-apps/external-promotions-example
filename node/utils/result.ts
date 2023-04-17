enum Variant {
  Ok = 'ok',
  Err = 'err'
}

interface Ok<T> {
  variant: Variant.Ok,
  value: T
}

interface Err<E> {
  variant: Variant.Err,
  error: E
}

type Repr<T, E> = Ok<T> | Err<E>

export class Result<T, E> {
  private constructor(private repr: Repr<T, E>) {}  

  static ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>({ variant: 'ok', value } as Repr<T, E>)
  }

  static err<T, E>(error: E): Result<T, E> {
    return new Result<T, E>({ variant: 'err', error } as Repr<T, E>)
  }

  get value(): T | never {
    if (this.repr.variant === Variant.Err) {
      throw new Error('Cannot get the value of Err');
    }

    return this.repr.value;
  }

  get error(): E | never {
    if (this.repr.variant === Variant.Ok) {
      throw new Error('Cannot get the error of Ok');
    }

    return this.repr.error;
  }

  get isErr(): boolean {
    return this.repr.variant === Variant.Err
  }
}