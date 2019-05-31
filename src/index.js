import hash from "@emotion/hash";
import stylis from "stylis";
import { writeFile } from "fs";

const styles = {};

function getClassName(styles) {
  return "c" + hash(styles);
}

export default function(babel) {
  const t = babel.types;
  return {
    visitor: {
      ImportDeclaration(path) {
        if (path.node.source.value !== "use-css") return;
        path.remove();
      },
      CallExpression(path) {
        if (path.node.callee.name !== "useCSS") return;
        let className;
        path.traverse({
          TemplateLiteral(path) {
            if (path.node.quasis.length === 1) return;
            const templateLiteral = path.node;

            const identifier = path.parentPath.parentPath.node.id.name;

            // convert string literal into string
            const quasis = [...templateLiteral.quasis];
            let staticStyle = ``,
              cssVarName,
              value;

            quasis.map((el, i) => {
              if (!el.tail) {
                const expr = templateLiteral.expressions[i];

                // check whether the value is an object or an identifier
                if (t.isMemberExpression(expr)) {
                  value = `${expr.object.name}.${expr.property.name}`;
                } else {
                  value = expr.name;
                }

                // generating unique css variable name
                cssVarName = hash(value);
                // adding it to the style
                el.value.cooked += `var(--${cssVarName})`;
              }
              staticStyle += el.value.cooked;
            });

            // add the css variabe name with its value to the styles obj(dynamic styles)
            styles[identifier] = [cssVarName, value];

            // remove all spaces and line breaks to avoid reconstructing template literal
            const finalStaticStyle = staticStyle.replace(/\r?\n|\r|\s/g, "");

            className = getClassName(finalStaticStyle);

            const rawCSS = stylis("." + className, finalStaticStyle);

            // save it to the file
            writeFile("bundle.css", rawCSS, function(err) {
              if (err) throw err;
            });
          }
        });
        path.replaceWith(t.StringLiteral(className));
      },
      JSXAttribute(path) {
        if (path.node.value.type !== "JSXExpressionContainer") return;
        if (!styles[path.node.value.expression.name]) return;
        const identifier = path.node.value.expression.name;
        // add style attribute to JSX for dynamic styles
        path.parentPath.node.attributes.push(
          t.JSXAttribute(
            t.JSXIdentifier("style"),
            t.JSXExpressionContainer(
              t.ObjectExpression([
                t.ObjectProperty(
                  t.StringLiteral(`--${styles[identifier][0]}`),
                  t.Identifier(styles[identifier][1])
                )
              ])
            )
          )
        );
      }
    }
  };
}
