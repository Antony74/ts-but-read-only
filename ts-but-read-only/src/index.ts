import * as ts from 'typescript';
import type { TransformerExtras, PluginConfig } from 'ts-patch';

const kinds = Object.fromEntries(
    Object.entries(ts.SyntaxKind).map((arr) => arr.reverse())
);

export default (
    program: ts.Program,
    _pluginConfig: PluginConfig,
    transformer: TransformerExtras
) => {
    const tsInstance = transformer.ts;
    const typeChecker = program.getTypeChecker();

    return (ctx: ts.TransformationContext) => {
        const { factory } = ctx;

        const createVisitFn = (depth: number) => {
            const visit = (node: ts.Node): ts.Node => {
                const spaces = '    '.repeat(depth);
                const text = node.getText().trim();
                console.log(`${spaces}visiting ${kinds[node.kind]}, ${text}`);

                // const currentType = typeChecker.getTypeAtLocation(node);
                // console.log(`${spaces}type symbol ${currentType.symbol}`);

                if (
                    tsInstance.isVariableDeclarationList(node) &&
                    !(node.flags & ts.NodeFlags.Const)
                ) {
                    return factory.createVariableDeclarationList(
                        node.declarations,
                        ts.NodeFlags.Const
                    );
                }

                return tsInstance.visitEachChild(
                    node,
                    createVisitFn(depth + 1),
                    ctx
                );
            };
            return visit;
        };

        return (sourceFile: ts.SourceFile) => {
            return tsInstance.visitNode(sourceFile, createVisitFn(0));
        };
    };
};
