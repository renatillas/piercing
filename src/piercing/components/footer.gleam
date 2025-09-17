import lustre/attribute
import lustre/element
import lustre/element/html

pub fn footer() {
  html.footer(
    [
      attribute.class(
        "bg-black/90 border-t border-gray-700 py-8 px-4 sm:px-6 lg:px-8",
      ),
    ],
    [
      html.div([attribute.class("max-w-6xl mx-auto")], [
        html.div(
          [
            attribute.class(
              "grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8",
            ),
          ],
          [
            // Contact Info
            html.div([attribute.class("text-center md:text-left")], [
              html.h4(
                [
                  attribute.class(
                    "text-xl font-bold text-white mb-4 tracking-wide",
                  ),
                  attribute.style("font-family", "'Dark Reborn', sans-serif"),
                ],
                [element.text("CONTACTO")],
              ),
              html.p([attribute.class("text-gray-300 mb-2")], [
                element.text("+34 663 73 66 31"),
              ]),
              html.p([attribute.class("text-gray-300 mb-2")], [
                element.text("@kei_te_pinxa"),
              ]),
            ]),
            // Hours
            html.div([attribute.class("text-center md:text-left")], [
              html.h4(
                [
                  attribute.class(
                    "text-xl font-bold text-white mb-4 tracking-wide",
                  ),
                  attribute.style("font-family", "'Dark Reborn', sans-serif"),
                ],
                [element.text("HORARIO")],
              ),
              html.p([attribute.class("text-gray-300 mb-2")], [
                element.text("Lunes a Sábado: 14:00 - 20:00"),
              ]),
              html.p([attribute.class("text-gray-300")], [
                element.text("Domingo: Cerrado"),
              ]),
            ]),
            // Address
            html.div([attribute.class("text-center md:text-left")], [
              html.h4(
                [
                  attribute.class(
                    "text-xl font-bold text-white mb-4 tracking-wide",
                  ),
                  attribute.style("font-family", "'Dark Reborn', sans-serif"),
                ],
                [element.text("DIRECCIÓN")],
              ),
              html.p([attribute.class("text-gray-300")], [
                element.text("C/ Doctor Jaume Segarra, 4"),
                html.br([]),
                element.text("46019 Valencia, España"),
              ]),
            ]),
          ],
        ),
        html.div([attribute.class("border-t border-gray-700 pt-6")], [
          html.div(
            [
              attribute.class(
                "flex flex-col md:flex-row justify-between items-center gap-4",
              ),
            ],
            [
              html.div([attribute.class("text-center md:text-left")], [
                html.p(
                  [
                    attribute.class("text-gray-400 text-sm"),
                    attribute.style("font-family", "'Dark Reborn', sans-serif"),
                  ],
                  [element.text("Piercer y modificadora corporal desde 2023")],
                ),
              ]),
              html.div([attribute.class("flex gap-4 text-sm text-gray-400")], [
                html.a([attribute.class("hover:text-white transition-colors")], [
                  element.text("Aviso legal"),
                ]),
                html.a([attribute.class("hover:text-white transition-colors")], [
                  element.text("Política de privacidad"),
                ]),
                html.a([attribute.class("hover:text-white transition-colors")], [
                  element.text("Política de Cookies"),
                ]),
              ]),
            ],
          ),
        ]),
      ]),
    ],
  )
}
