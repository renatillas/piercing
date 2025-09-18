import lustre/attribute
import lustre/element
import lustre/element/html

pub type LegalPageType {
  AvisoLegal
  PoliticaPrivacidad
  PoliticaCookies
}

pub fn legal_page(page_type: LegalPageType) {
  html.div(
    [
      attribute.class(
        "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12",
      ),
    ],
    [
      case page_type {
        AvisoLegal -> aviso_legal_content()
        PoliticaPrivacidad -> politica_privacidad_content()
        PoliticaCookies -> politica_cookies_content()
      }
    ]
  )
}

fn aviso_legal_content() {
  html.div([attribute.class("max-w-5xl mx-auto")], [
    html.h1(
      [
        attribute.class(
          "text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 text-white tracking-wide",
        ),
        attribute.style("font-family", "'Dark Reborn', sans-serif"),
      ],
      [element.text("Aviso Legal")],
    ),
    html.div([attribute.class("prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-6")], [
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("1. Información General")]),
        html.p([], [
          element.text("Este sitio web tiene carácter meramente informativo y de portfolio profesional. En cumplimiento de la normativa vigente, se informa:")
        ]),
        html.ul([attribute.class("list-disc ml-6 space-y-2")], [
          html.li([], [element.text("Titular: Kei Te Pinxa")]),
          html.li([], [element.text("Actividad: Servicios de piercing y modificaciones corporales")]),
          html.li([], [element.text("Ubicación: C/ Doctor Jaume Segarra, 4, 46019 Valencia, España")]),
          html.li([], [element.text("Teléfono: +34 663 73 66 31")]),
          html.li([], [element.text("Contacto: @kei_te_pinxa (Instagram)")]),
          html.li([], [element.text("Horario: Lunes a Sábado de 14:00 a 20:00h")]),
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("2. Finalidad del Sitio Web")]),
        html.p([], [
          element.text("Este sitio web es un portfolio informativo que muestra nuestro trabajo y proporciona información sobre nuestros servicios de piercing. No se realizan transacciones comerciales online.")
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("3. Condiciones de Uso")]),
        html.p([], [
          element.text("El acceso y navegación por este sitio web es gratuito. El uso del sitio implica la aceptación de estas condiciones:")
        ]),
        html.ul([attribute.class("list-disc ml-6 space-y-2 mt-3")], [
          html.li([], [element.text("La información mostrada es orientativa y puede estar sujeta a cambios")]),
          html.li([], [element.text("Para servicios reales, contactar directamente en el establecimiento")]),
          html.li([], [element.text("El usuario debe usar el sitio de forma responsable y lícita")]),
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("4. Propiedad Intelectual")]),
        html.p([], [
          element.text("Todos los contenidos de este sitio web (textos, imágenes, fotografías, diseño) son propiedad de Kei Te Pinxa y están protegidos por derechos de propiedad intelectual. Queda prohibida su reproducción sin autorización.")
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("5. Exención de Responsabilidad")]),
        html.p([], [
          element.text("Kei Te Pinxa no garantiza la disponibilidad continua del sitio web ni se responsabiliza de:")
        ]),
        html.ul([attribute.class("list-disc ml-6 space-y-2 mt-3")], [
          html.li([], [element.text("Interrupciones técnicas o errores en el sitio")]),
          html.li([], [element.text("Decisiones tomadas basándose únicamente en la información del sitio")]),
          html.li([], [element.text("Daños derivados del uso inadecuado del sitio web")]),
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("6. Enlaces Externos")]),
        html.p([], [
          element.text("Este sitio puede contener enlaces a páginas de terceros (redes sociales). Kei Te Pinxa no se responsabiliza del contenido o políticas de privacidad de estos sitios externos.")
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("7. Legislación Aplicable")]),
        html.p([], [
          element.text("Este aviso legal se rige por la legislación española. Para cualquier controversia, será competente la jurisdicción de Valencia, España.")
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("8. Modificaciones")]),
        html.p([], [
          element.text("Este aviso legal puede modificarse. La versión vigente será siempre la publicada en este sitio web.")
        ]),
        html.p([attribute.class("text-sm text-gray-400 mt-4")], [
          element.text("Última actualización: Enero 2025")
        ]),
      ]),
    ]),
  ])
}

fn politica_privacidad_content() {
  html.div([attribute.class("max-w-5xl mx-auto")], [
    html.h1(
      [
        attribute.class(
          "text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 text-white tracking-wide",
        ),
        attribute.style("font-family", "'Dark Reborn', sans-serif"),
      ],
      [element.text("Política de Privacidad")],
    ),
    html.div([attribute.class("prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-6")], [
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("1. Información Básica")]),
        html.p([], [
          element.text("Este sitio web es un portfolio informativo. Los datos que pudiéramos recopilar se tratarán con total respeto a su privacidad y conforme al RGPD:")
        ]),
        html.ul([attribute.class("list-disc ml-6 space-y-2 mt-3")], [
          html.li([], [element.text("Responsable: Kei Te Pinxa")]),
          html.li([], [element.text("Contacto: +34 663 73 66 31 / @kei_te_pinxa")]),
          html.li([], [element.text("Ubicación: C/ Doctor Jaume Segarra, 4, Valencia")]),
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("2. Qué Datos Recopilamos")]),
        html.p([attribute.class("mb-4")], [element.text("En este sitio web podemos recopilar:")]),
        html.ul([attribute.class("list-disc ml-6 space-y-2")], [
          html.li([], [element.text("Datos de navegación: Cookies técnicas necesarias para el funcionamiento")]),
          html.li([], [element.text("Datos de contacto: Solo si nos contacta por teléfono o redes sociales")]),
          html.li([], [element.text("No recopilamos datos personales automáticamente a través del sitio web")]),
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("3. Para Qué Usamos los Datos")]),
        html.p([], [
          element.text("Los datos que pudieran proporcionarse se usan únicamente para:")
        ]),
        html.ul([attribute.class("list-disc ml-6 space-y-2 mt-3")], [
          html.li([], [element.text("Responder a consultas sobre servicios")]),
          html.li([], [element.text("Gestionar citas (presencialmente o por teléfono)")]),
          html.li([], [element.text("Mejorar el funcionamiento del sitio web")]),
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("4. Sus Derechos")]),
        html.p([attribute.class("mb-4")], [element.text("Tiene derecho a:")]),
        html.ul([attribute.class("list-disc ml-6 space-y-2")], [
          html.li([], [element.text("Saber qué datos tenemos sobre usted")]),
          html.li([], [element.text("Corregir datos incorrectos")]),
          html.li([], [element.text("Solicitar la eliminación de sus datos")]),
          html.li([], [element.text("Retirar su consentimiento en cualquier momento")]),
        ]),
        html.p([attribute.class("mt-4")], [
          element.text("Para ejercer estos derechos, contacte en +34 663 73 66 31 o visite el estudio.")
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("5. Seguridad")]),
        html.p([], [
          element.text("Aplicamos medidas de seguridad adecuadas para proteger sus datos personales contra acceso no autorizado, pérdida o uso indebido.")
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("6. Cookies")]),
        html.p([], [
          element.text("Este sitio web utiliza únicamente cookies técnicas necesarias para su funcionamiento básico. No utilizamos cookies de marketing o análisis sin su consentimiento. Consulte nuestra Política de Cookies para más información.")
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("7. Terceros")]),
        html.p([], [
          element.text("No compartimos sus datos personales con terceros, excepto cuando sea legalmente requerido.")
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("8. Reclamaciones")]),
        html.p([], [
          element.text("Si considera que no tratamos sus datos correctamente, puede presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es) o contactar con nosotros directamente.")
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("9. Actualizaciones")]),
        html.p([], [
          element.text("Esta política puede actualizarse ocasionalmente. La versión actual estará siempre disponible en este sitio web.")
        ]),
        html.p([attribute.class("text-sm text-gray-400 mt-4")], [
          element.text("Última actualización: Enero 2025")
        ]),
      ]),
    ]),
  ])
}

fn politica_cookies_content() {
  html.div([attribute.class("max-w-5xl mx-auto")], [
    html.h1(
      [
        attribute.class(
          "text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 text-white tracking-wide",
        ),
        attribute.style("font-family", "'Dark Reborn', sans-serif"),
      ],
      [element.text("Política de Cookies")],
    ),
    html.div([attribute.class("prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-6")], [
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("1. ¿Qué son las Cookies?")]),
        html.p([], [
          element.text("Las cookies son pequeños archivos que se almacenan en su dispositivo cuando visita nuestro sitio web. Este es un portfolio informativo que utiliza cookies de forma muy limitada.")
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("2. Cookies que Utilizamos")]),
        
        html.h3([attribute.class("text-xl font-semibold text-white mb-3 mt-6")], [element.text("Cookies Técnicas (Necesarias)")]),
        html.p([], [
          element.text("Solo utilizamos cookies esenciales para el funcionamiento básico del sitio:")
        ]),
        html.ul([attribute.class("list-disc ml-6 space-y-2 mt-3")], [
          html.li([], [element.text("Cookies de sesión para la navegación")]),
          html.li([], [element.text("Cookies para recordar preferencias de la interfaz")]),
          html.li([], [element.text("Estas cookies no requieren consentimiento")]),
        ]),
        
        html.h3([attribute.class("text-xl font-semibold text-white mb-3 mt-6")], [element.text("Cookies Analíticas")]),
        html.p([], [
          element.text("Actualmente NO utilizamos cookies de análisis como Google Analytics, pero si en el futuro las implementáramos, solicitaremos su consentimiento.")
        ]),
        
        html.h3([attribute.class("text-xl font-semibold text-white mb-3 mt-6")], [element.text("Cookies de Redes Sociales")]),
        html.p([], [
          element.text("Si visita nuestras redes sociales desde el sitio, esos servicios pueden establecer sus propias cookies según sus políticas.")
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("3. Control de Cookies")]),
        html.p([attribute.class("mb-4")], [element.text("Usted puede controlar las cookies de las siguientes formas:")]),
        
        html.h3([attribute.class("text-xl font-semibold text-white mb-3 mt-6")], [element.text("En su Navegador:")]),
        html.ul([attribute.class("list-disc ml-6 space-y-2")], [
          html.li([], [element.text("Chrome: Configuración > Privacidad y seguridad > Cookies")]),
          html.li([], [element.text("Firefox: Preferencias > Privacidad y Seguridad")]),
          html.li([], [element.text("Safari: Preferencias > Privacidad")]),
          html.li([], [element.text("Edge: Configuración > Privacidad")]),
        ]),
        html.p([attribute.class("mt-4 text-sm")], [
          element.text("Nota: Desactivar las cookies técnicas puede afectar al funcionamiento del sitio web.")
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("4. Duración")]),
        html.ul([attribute.class("list-disc ml-6 space-y-2")], [
          html.li([], [element.text("Cookies de sesión: Se eliminan al cerrar el navegador")]),
          html.li([], [element.text("Cookies de preferencias: Máximo 1 año")]),
          html.li([], [element.text("Futuras cookies analíticas: Máximo 2 años (si se implementan)")]),
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("5. Consentimiento")]),
        html.p([], [
          element.text("Las cookies técnicas no requieren consentimiento al ser necesarias para el funcionamiento del sitio. Si en el futuro implementamos cookies de análisis o marketing, solicitaremos su consentimiento previo con opciones claras para aceptar o rechazar.")
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("6. Terceros")]),
        html.p([], [
          element.text("Actualmente no utilizamos servicios de terceros que establezcan cookies en nuestro sitio. Los enlaces a redes sociales no establecen cookies hasta que haga clic en ellos.")
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("7. Actualizaciones")]),
        html.p([], [
          element.text("Esta política se actualiza si cambiamos el uso de cookies. Cualquier cambio importante será comunicado en el sitio web.")
        ]),
      ]),
      
      html.section([], [
        html.h2([attribute.class("text-2xl font-bold text-white mb-4")], [element.text("8. Contacto")]),
        html.p([], [
          element.text("Para consultas sobre cookies, contacte:")
        ]),
        html.ul([attribute.class("list-disc ml-6 space-y-2 mt-3")], [
          html.li([], [element.text("Teléfono: +34 663 73 66 31")]),
          html.li([], [element.text("Instagram: @kei_te_pinxa")]),
          html.li([], [element.text("Establecimiento: C/ Doctor Jaume Segarra, 4, Valencia")]),
        ]),
        html.p([attribute.class("text-sm text-gray-400 mt-4")], [
          element.text("Última actualización: Enero 2025 - Portfolio informativo")
        ]),
      ]),
    ]),
  ])
}