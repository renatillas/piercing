import lustre/attribute
import lustre/element
import lustre/element/html

pub fn navbar() {
  html.nav(
    [
      attribute.class(
        "bg-black/50 border-b-2 border-gray-700 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-50",
      ),
    ],
    [
      html.div([attribute.class("nav-brand mb-2 sm:mb-0")], [
        html.a(
          [
            attribute.class(
              "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wider text-white",
            ),
            attribute.href("/"),
          ],
          [element.text("EI  PINX")],
        ),
      ]),
      html.div(
        [
          attribute.class(
            "flex flex-wrap gap-2 sm:gap-4 lg:gap-8 justify-center sm:justify-end",
          ),
        ],
        [
          html.a(
            [
              attribute.class(
                "border-2 border-transparent hover:text-black text-white px-2 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-bold tracking-wide hover:border-white hover:bg-white hover:bg-opacity-10 transition-all duration-300",
              ),
              attribute.href("/gallery"),
            ],
            [element.text("GALERÍA")],
          ),
          html.a(
            [
              attribute.class(
                "border-2 border-transparent hover:text-black text-white px-2 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-bold tracking-wide hover:border-white hover:bg-white hover:bg-opacity-10 transition-all duration-300",
              ),
              attribute.href("/about"),
            ],
            [element.text("SOBRE MÍ")],
          ),
          html.a(
            [
              attribute.class(
                "border-2 border-transparent text-white hover:text-black px-2 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-bold tracking-wide hover:border-white hover:bg-white hover:bg-opacity-10 transition-all duration-300",
              ),
              attribute.href("/contact"),
            ],
            [element.text("CONTACTO")],
          ),
        ],
      ),
    ],
  )
}
