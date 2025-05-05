import * as ts from 'typescript';
import type { TransformerExtras, PluginConfig } from 'ts-patch';

const kinds = Object.fromEntries(Object.entries(ts.SyntaxKind).map(arr => arr.reverse()));

/** Changes string literal 'before' to 'after' */
export default (
    _program: ts.Program,
    _pluginConfig: PluginConfig,
    transformer: TransformerExtras
) => {
    const tsInstance = transformer.ts;

    return (ctx: ts.TransformationContext) => {
        const { factory } = ctx;

        const visit = (node: ts.Node): ts.Node => {
            console.log(`visiting ${kinds[node.kind]}, ${node.getText().trim()}`);

            if (tsInstance.isStringLiteral(node) && node.text === 'before') {
                return factory.createStringLiteral('after');
            }
            return tsInstance.visitEachChild(node, visit, ctx);
        };

        return (sourceFile: ts.SourceFile) => {
            return tsInstance.visitNode(sourceFile, visit);
        };
    };
};
