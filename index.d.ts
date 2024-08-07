type Values = {
    [field: string]: any;
};
export type Rule<VS extends Values, F extends keyof VS, PS = void> = (this: Validation<VS, PS | void>, value: VS[F], field: F) => void;
export type Schema<VS extends Values, PS = void> = {
    [F in keyof VS]?: Rule<VS, F, PS> | Rule<VS, F, PS>[];
};
type Errors = Record<string, string[]>;
export type ValidationBase<VS extends Values> = {
    valid: boolean;
    errors: Errors;
};
export type ValidationParams<VS extends Values, PS> = {
    field?: keyof VS;
    compare?: ValidationBase<VS>;
    params?: PS;
};
interface CreatedRule {
    <VS extends Values, PS, F extends keyof VS>(this: Validation<VS, PS>, value: VS[F], field: F): void;
}
export declare class Validation<VS extends Values, PS> {
    valid: boolean;
    errors: Errors;
    values: VS;
    schema: Schema<VS, PS>;
    params: PS | void;
    constructor(values: VS, params: PS, schema: Schema<VS, PS>);
    error(field: string, message: string): void;
    useRules<F extends keyof VS>(value: VS[F], field: F, rules: Rule<VS, F, PS>[]): void;
    validateField<F extends keyof VS>(field: F): this;
    valueOf(): ValidationBase<VS>;
}
declare class Validator<VS extends Values, PS = void> {
    static RULES: {
        Required: (message: string) => CreatedRule;
        LessThen: (limit: number, message: string) => CreatedRule;
        NotLessThen: (limit: number, message: string) => CreatedRule;
        MoreThen: (limit: number, message: string) => CreatedRule;
        NotMoreThen: (limit: number, message: string) => CreatedRule;
        Between: (min: number, max: number, message: string) => CreatedRule;
        Match: (regExp: RegExp, message: string) => CreatedRule;
        NotLonger: (limit: number, message: string) => CreatedRule;
        NotShorter: (limit: number, message: string) => CreatedRule;
    };
    static createRule<VS extends Values, V, PS = void>(rule: (this: Validation<VS, PS>, value: V, field: keyof VS) => void): (this: Validation<VS, PS>, value: V, field: keyof VS) => void;
    schema: Schema<VS, PS>;
    constructor(schema: Schema<VS, PS>);
    validate(values: VS, params?: ValidationParams<VS, PS>): ValidationBase<VS>;
}
export default Validator;
