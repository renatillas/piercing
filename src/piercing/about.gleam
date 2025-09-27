import lustre/attribute
import lustre/element
import lustre/element/html

pub fn about_page() {
  html.div(
    [
      attribute.class("max-w-7xl mx-auto px-6 lg:px-8 py-6 lg:py-8"),
    ],
    [
      html.h1(
        [
          attribute.class(
            "hidden lg:block font-[Dark_Reborn] text-5xl font-bold text-center mb-12 tracking-wide text-white",
          ),
        ],
        [element.text("obre m")],
      ),
      html.div(
        [
          attribute.class(
            "max-w-5xl mx-auto lg:p-12 flex gap-10 flex-col lg:flex-row items-center",
          ),
        ],
        [
          html.div([attribute.class("flex justify-center")], [
            html.div(
              [
                attribute.class(
                  "w-80 h-full bg-white rounded-lg flex items-center justify-center overflow-hidden",
                ),
              ],
              [
                html.img([
                  attribute.src("/priv/static/profile_picture.jpeg"),
                  attribute.alt("Avatar de Kei"),
                  attribute.class("w-full object-cover"),
                  attribute.fetchpriority("high"),
                  attribute.loading("eager"),
                ]),
              ],
            ),
          ]),
          html.div([attribute.class("flex-col gap-5 flex")], [
            html.p(
              [
                attribute.class(
                  "text-base sm:text-lg text-gray-300 leading-relaxed",
                ),
              ],
              [
                element.text(
                  "Hola soy Kei, aprendiz de piercer profesional y apasionado por el arte corporal. Desde que comencé mi viaje en el mundo del piercing, he tenido la oportunidad de trabajar con una variedad de clientes, ayudándoles a expresar su individualidad a través de perforaciones seguras y de alta calidad.",
                ),
              ],
            ),
            html.p(
              [
                attribute.class(
                  "text-base sm:text-lg text-gray-300 leading-relaxed",
                ),
              ],
              [
                element.text(
                  "Creo que las perforaciones corporales son una forma de arte y expresión personal. Mi objetivo es ayudarte a lograr el look que deseas mientras aseguro tu seguridad y comodidad durante todo el proceso.",
                ),
              ],
            ),
          ]),
        ],
      ),
    ],
  )
}
