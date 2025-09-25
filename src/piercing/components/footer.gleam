import lustre/attribute
import lustre/element
import lustre/element/html

pub fn footer() {
  html.footer(
    [
      attribute.class("relative max-w-dvw"),
    ],
    [
      // Footer divisor image
      html.div(
        [attribute.class("w-full overflow-hidden flex justify-center z-50")],
        [
          html.img([
            attribute.src("/priv/static/footer-divisor.png"),
            attribute.class("shadow lg:max-w-7xl h-auto object-cover"),
            attribute.alt("Footer divisor"),
            attribute.attribute("loading", "lazy"),
          ]),
        ],
      ),
      html.div(
        [
          attribute.class("relative py-6 px-4 sm:px-6 lg:px-8"),
          attribute.style(
            "background",
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.9) 100%)",
          ),
        ],
        [
          html.div([attribute.class("max-w-7xl mx-auto")], [
            html.div(
              [
                attribute.class(
                  "grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-0",
                ),
              ],
              [
                mini_hero(),
                contact_info(),
                hours(),
                info_designer_and_developer(),
              ],
            ),
          ]),
        ],
      ),
    ],
  )
}

fn contact_info() {
  html.div([attribute.class("md:text-left pt-3")], [
    html.h4(
      [
        attribute.class(
          "text-center text-2xl font-bold text-white mb-3 tracking-wide",
        ),
        attribute.style("font-family", "'Dark Reborn', sans-serif"),
      ],
      [element.text("CONTACTO")],
    ),
    html.p([attribute.class("text-center text-gray-300 mb-2")], [
      element.text("+34 644 09 12 10"),
    ]),
    html.p([attribute.class("text-center text-gray-300")], [
      html.a([attribute.href("https://www.instagram.com/keitepinxa/")], [
        element.text("@keitepinxa"),
      ]),
    ]),
  ])
}

fn hours() {
  html.div([attribute.class("text-left lg:col-start-4 lg:col-span-2 pt-3")], [
    html.h4(
      [
        attribute.class(
          "text-center text-2xl font-bold text-white mb-3 tracking-wide",
        ),
        attribute.style("font-family", "'Dark Reborn', sans-serif"),
      ],
      [element.text("HORARIO")],
    ),
    html.div([attribute.class("flex flex-col items-center")], [
      html.div([attribute.class("mb-3")], [
        html.p([attribute.class("text-gray-300")], [
          element.text("Lunes a Sábado: 14:00 - 20:00"),
        ]),
        html.p([attribute.class("text-gray-300")], [
          element.text("Domingo: Cerrado"),
        ]),
      ]),
      address(),
    ]),
  ])
}

fn address() {
  html.div([attribute.class("text-left")], [
    html.p([attribute.class("text-gray-300")], [
      element.text("C/ Doctor Jaume Segarra, 4"),
      html.br([]),
      element.text("46019 Valencia, España"),
    ]),
  ])
}

fn legal() {
  html.div(
    [
      attribute.class(
        "flex justify-center gap-1 lg:gap-2 lg:text-sm text-xs text-gray-400",
      ),
    ],
    [
      html.a(
        [
          attribute.class("hover:text-white text-center"),
          attribute.href("/aviso-legal"),
        ],
        [
          element.text("Aviso legal"),
        ],
      ),
      html.text("✧"),
      html.a(
        [
          attribute.class("hover:text-white text-center"),
          attribute.href("/politica-privacidad"),
        ],
        [
          element.text("Política de privacidad"),
        ],
      ),
      html.text("✧"),
      html.a(
        [
          attribute.class("hover:text-white text-center"),
          attribute.href("/politica-cookies"),
        ],
        [
          element.text("Política de Cookies"),
        ],
      ),
    ],
  )
}

fn mini_hero() {
  html.div(
    [attribute.class("flex flex-col gap-2 lg:col-start-1 lg:col-span-2")],
    [
      html.p(
        [
          attribute.class("text-center text-4xl font-bold text-white mb-2"),
          attribute.style("font-family", "'Dark Reborn', sans-serif"),
        ],
        [element.text("EI  PINX")],
      ),
      html.p([attribute.class("text-center text-gray-300")], [
        element.text("Piercer desde 2025"),
      ]),
      html.div([attribute.class("")], [legal()]),
    ],
  )
}

fn info_designer_and_developer() {
  html.div([attribute.class("text-left lg:col-start-2 lg:col-span-3")], [
    html.div([attribute.class("text-center text-gray-300")], [
      element.text("Diseño por "),
      html.a(
        [
          attribute.href("https://www.instagram.com/rinrindoesart/"),
          attribute.class("hover:text-white"),
          attribute.target("_blank"),
          attribute.rel("noopener"),
        ],
        [element.text("Lucía Nadal")],
      ),
      element.text(" y desarrollo por "),
      html.a(
        [
          attribute.href("https://renatillas.pages.dev/"),
          attribute.class("hover:text-white"),
          attribute.target("_blank"),
          attribute.rel("noopener"),
        ],
        [element.text("Renatillas")],
      ),
    ]),
  ])
}
