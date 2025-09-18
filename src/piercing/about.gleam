import lustre/attribute
import lustre/element
import lustre/element/html

pub fn about_page() {
  html.div(
    [
      attribute.class(
        "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8",
      ),
    ],
    [
      html.h2(
        [
          attribute.class(
            "font-[Dark_Reborn] text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 lg:mb-12 tracking-wide sm:tracking-widest text-white",
          ),
        ],
        [element.text("obre m")],
      ),
      html.div(
        [
          attribute.class(
            "max-w-5xl mx-auto p-6 sm:p-8 lg:p-12 border border-gray-700",
          ),
        ],
        [
          html.p(
            [
              attribute.class(
                "mb-4 sm:mb-6 text-base sm:text-lg text-gray-300 leading-relaxed",
              ),
            ],
            [
              element.text(
                "Kei Te Pinxa es un estudio de perforaciones corporales premier dedicado a proporcionar modificaciones corporales seguras, profesionales y artísticas. Nuestros perforadores experimentados usan solo materiales de la más alta calidad y mantienen los estándares de higiene más estrictos.",
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
                "Creemos que las perforaciones corporales son una forma de arte y expresión personal. Nuestro objetivo es ayudarte a lograr el look que deseas mientras aseguramos tu seguridad y comodidad durante todo el proceso.",
              ),
            ],
          ),
        ],
      ),
    ],
  )
}
