import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nutzungsbedingungen",
  description: "Allgemeine Geschäftsbedingungen für die Nutzung von places4friends.",
};

export default function AgbPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 pb-20 font-sans">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-center border-b border-slate-100 bg-white px-4">
        <Link
          href="/profile"
          className="absolute left-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
          aria-label="Zurück"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-sm font-bold text-slate-900">Nutzungsbedingungen</h1>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 text-sm leading-relaxed text-slate-700">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          <Scale className="h-8 w-8 text-brand-green-700 shrink-0" />
          <div>
            <h2 className="font-bold text-slate-800">Nutzungsbedingungen</h2>
            <p className="text-xs text-slate-500">Stand: September 2026</p>
          </div>
        </div>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">1. Geltungsbereich</h3>
          <p>
            Diese Nutzungsbedingungen regeln die Nutzung von places4friends (nachfolgend „App“) – sowohl der Web-App als
            auch der mobilen Anwendungen für iOS und Android. Betreiber ist Janick Braun, Krottenkopfstr. 24a, 82377
            Penzberg (Angaben im{" "}
            <Link href="/impressum" className="text-brand-green-700 hover:underline">
              Impressum
            </Link>
            ). Mit der Registrierung oder Nutzung der App akzeptieren Sie diese Bedingungen.
          </p>
          <p>
            Die mobilen Anwendungen werden über den App Store von Apple bzw. Google Play bezogen. Zusätzlich gelten die
            Bedingungen des jeweiligen Store-Betreibers. Der Vertrag über die Nutzung der App kommt ausschließlich
            zwischen Ihnen und dem oben genannten Betreiber zustande; Apple und Google sind daran nicht beteiligt und
            insbesondere nicht für die App, deren Inhalte oder den Support verantwortlich. Etwaige Gewährleistungs- und
            Produkthaftungsansprüche sowie Ansprüche wegen der Verletzung von Rechten Dritter richten sich allein gegen
            den Betreiber. Die Nutzung der App ist unentgeltlich; kostenpflichtige Funktionen bestehen derzeit nicht.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">2. Leistungsbeschreibung</h3>
          <p>
            places4friends ist eine soziale Empfehlungs-App: Nutzer können Lieblingsorte auf einer interaktiven Karte
            teilen, sich mit Freunden vernetzen, Empfehlungen kommentieren und in einer Merkliste sammeln. Hinzu kommen
            insbesondere die Weitergabe fremder Empfehlungen an das eigene Netzwerk („Repost“, siehe § 6), das Hervorheben
            einzelner Empfehlungen als „Must-See“, Mitteilungen zu Ereignissen im eigenen Netzwerk (in der App und
            optional als Push-Nachricht), persönliche Einladungslinks, Freundschaftsvorschläge, ein freiwilliger Abgleich
            des Adressbuchs, optionale Verweise auf das eigene Instagram- oder TikTok-Profil sowie die Übernahme von Orten
            aus Google Maps.
          </p>
          <p>
            Empfehlungen, Kommentare und Merklisten sind grundsätzlich nur für Sie und Ihre bestätigten Freundinnen und
            Freunde sichtbar; Profilangaben (Benutzername, Name, Profilbild, Kurzbeschreibung und die von Ihnen
            angegebenen Social-Media-Benutzernamen) sind für alle angemeldeten Nutzer sichtbar.
            Welche Ausnahmen es davon gibt, beschreibt Abschnitt 4 unserer{" "}
            <Link href="/datenschutz" className="text-brand-green-700 hover:underline">
              Datenschutzerklärung
            </Link>
            .
          </p>
          <p>
            Der konkrete Funktionsumfang kann sich im Rahmen der Weiterentwicklung ändern. Die mobilen Anwendungen können
            Aktualisierungen automatisch nachladen.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">3. Registrierung und Konto</h3>
          <p>
            Für die volle Nutzung ist ein Nutzerkonto erforderlich. Sie müssen mindestens 16 Jahre alt sein. Sie sind für die
            Geheimhaltung Ihrer Zugangsdaten verantwortlich und verpflichtet, wahrheitsgemäße Angaben zu machen. Ein Konto pro
            Person ist erwünscht; missbräuchliche Mehrfachkonten können gesperrt werden.
          </p>
          <p>
            Informationen zur Verarbeitung personenbezogener Daten finden Sie in unserer{" "}
            <Link href="/datenschutz" className="text-brand-green-700 hover:underline">
              Datenschutzerklärung
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">4. Nutzungspflichten</h3>
          <p>Sie verpflichten sich, die App nicht zu missbrauchen. Insbesondere ist untersagt:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>
              pornografische, sexuell explizite oder jugendgefährdende Inhalte zu veröffentlichen; die Darstellung
              sexuellen Missbrauchs von Minderjährigen ist absolut verboten und wird den zuständigen Behörden gemeldet
            </li>
            <li>
              rassistische, volksverhetzende, gewaltverherrlichende, extremistische oder zu Hass, Diskriminierung oder
              Gewalt gegen Personen oder Gruppen aufstachelnde Inhalte zu veröffentlichen
            </li>
            <li>andere Nutzer zu belästigen, zu bedrohen, zu mobben, bloßzustellen oder zu diskriminieren</li>
            <li>
              sich als eine andere Person, ein Unternehmen oder eine Organisation auszugeben oder auf andere Weise eine
              falsche Identität vorzutäuschen – etwa durch fremde Namen, fremde Profilbilder oder fremde Angaben in der
              Kurzbeschreibung
            </li>
            <li>sonstige rechtswidrige, beleidigende oder irreführende Inhalte zu veröffentlichen</li>
            <li>Rechte Dritter (z. B. Urheber-, Marken- oder Persönlichkeitsrechte) zu verletzen</li>
            <li>die technische Infrastruktur zu stören, auszuspähen oder unbefugt zuzugreifen</li>
            <li>automatisierte Abfragen (Scraping) ohne unsere Zustimmung durchzuführen</li>
            <li>die App für kommerzielle Werbung ohne vorherige Absprache zu nutzen</li>
          </ul>
          <p>
            <strong>Verweise auf Social-Media-Profile.</strong> Sie können in Ihrem Profil freiwillig einen Instagram-
            und einen TikTok-Benutzernamen angeben; die App zeigt daraus eine Schaltfläche, die den genannten
            Benutzernamen anzeigt und beim Antippen das entsprechende Profil im jeweiligen Netzwerk öffnet. Sie dürfen
            dort ausschließlich Konten angeben, die Ihnen selbst gehören oder die Sie nachweislich betreiben dürfen. Eine
            Überprüfung durch uns findet nicht statt – wir speichern und zeigen lediglich den Benutzernamen, den Sie
            eingetragen haben. Das Angeben eines fremden Kontos ist ein Verstoß gegen diese Bedingungen und kann
            zusätzlich Rechte der betroffenen Person verletzen. Instagram und TikTok sind Marken der jeweiligen
            Unternehmen; die Nennung dient allein der Kennzeichnung des verlinkten Netzwerks, eine Verbindung zu oder
            eine Unterstützung durch diese Unternehmen besteht nicht.
          </p>
          <p>
            Für rechtswidrige oder anstößige Inhalte sowie für belästigendes Verhalten gegenüber anderen Nutzern gilt
            eine Null-Toleranz-Politik. Derartige Inhalte werden entfernt und die verantwortlichen Konten können ohne
            Vorankündigung gesperrt oder gelöscht werden.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">5. Nutzerinhalte (User-Generated Content)</h3>
          <p>
            Für von Ihnen eingestellte Inhalte (Texte, Bilder, Empfehlungen, Kommentare) sind Sie allein verantwortlich. Mit
            dem Einstellen räumen Sie uns ein einfaches, nicht ausschließliches, zeitlich auf die Dauer der Bereitstellung in
            der App beschränktes Nutzungsrecht ein, um diese Inhalte in der App anzuzeigen, zu speichern und technisch zu
            verarbeiten – gegenüber den von Ihnen gewählten Empfängern (Ihren bestätigten Freundinnen und Freunden) sowie,
            soweit eine Weitergabe nach § 6 erfolgt, gegenüber deren Netzwerk. Dieses Recht endet mit Löschung des Inhalts
            oder Ihres Kontos; bereits erfolgte Weitergaben bleiben davon nach Maßgabe von § 6 unberührt.
          </p>
          <p>
            Sie versichern, über die erforderlichen Rechte an den eingestellten Inhalten zu verfügen. Bei Fotos, auf denen
            andere Personen erkennbar sind, benötigen Sie deren Einverständnis. Beim Übernehmen eigener Google-Bewertungen
            gilt dasselbe: Sie dürfen nur Inhalte einstellen, die von Ihnen stammen.
          </p>
          <p>
            Wir sind berechtigt, Inhalte zu entfernen oder Konten zu sperren, wenn ein begründeter Verdacht auf Verstöße gegen
            diese Bedingungen oder geltendes Recht besteht.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">6. Weitergabe von Empfehlungen (Reposts)</h3>
          <p>
            Nutzer können eine Empfehlung, die ihnen angezeigt wird, als eigenen Beitrag an ihr eigenes Netzwerk
            weitergeben. Dabei gilt:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>
              Die weitergegebenen Inhalte (Ortsangabe, Beschreibung, Bilder) werden dadurch auch Personen zugänglich, mit
              denen die ursprüngliche Urheberin bzw. der ursprüngliche Urheber nicht befreundet ist. Wer eine Empfehlung
              einstellt, willigt in diese Weitergabe ein, solange er sie nicht nach dem nächsten Punkt ausschließt.
            </li>
            <li>
              Beim Erstellen einer Empfehlung kann die Weitergabe ausgeschlossen werden (Funktion „Gatekeepen“). Diese
              Entscheidung ist nachträglich nicht mehr änderbar.
            </li>
            <li>
              Bei jeder Weitergabe wird die ursprüngliche Urheberin bzw. der ursprüngliche Urheber namentlich genannt.
              Diese Angabe kann von der weitergebenden Person nicht verändert oder entfernt werden und bleibt auch dann
              bestehen, wenn der ursprüngliche Beitrag gelöscht wird.
            </li>
            <li>
              Kommentare werden nicht mitübertragen: Ein weitergegebener Beitrag hat einen eigenen Kommentarbereich, den
              nur das Netzwerk der weitergebenden Person sieht.
            </li>
            <li>
              Für den weitergegebenen Beitrag ist die weitergebende Person nach § 5 verantwortlich; für den
              ursprünglichen Beitrag bleibt es bei der Verantwortlichkeit der Urheberin bzw. des Urhebers.
            </li>
            <li>
              Löschen Sie Ihre Empfehlung oder Ihr Konto, entfällt die Anzeige Ihres Beitrags. Bereits von anderen
              erstellte Weitergaben sind eigenständige Beiträge dieser Personen und bleiben bestehen; die Urheberangabe zu
              Ihrer Person bleibt daran erhalten. Wünschen Sie auch deren Entfernung, wenden Sie sich an uns.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">7. Moderation, Meldungen und Zugriff durch den Betreiber</h3>
          <p>
            Nutzer können sowohl einzelne Beiträge als auch ganze Profile über die in der App bereitgestellte
            Meldefunktion melden und andere Nutzer blockieren. Beim Melden geben Sie einen Grund an und können den
            Sachverhalt ergänzen; das ist zugleich die Angabe, die Art. 16 der Verordnung über digitale Dienste für eine
            wirksame Meldung vorsieht. Wir prüfen eingehende Meldungen und bemühen uns um eine zeitnahe Bearbeitung;
            rechtswidrige oder gegen diese Bedingungen verstoßende Inhalte werden entfernt. Über das Ergebnis der
            Prüfung informieren wir Sie als meldende Person in jedem Fall – auch dann, wenn wir keinen Verstoß
            feststellen konnten. Eine Blockierung wirkt dagegen nur zwischen Ihnen beiden: Sie und die blockierte Person
            werden einander in der App verborgen und bestehende Freundschaften und Anfragen zwischen Ihnen werden
            aufgelöst; eine Meldung ersetzt das nicht und umgekehrt.
          </p>
          <p>
            Entfernen wir einen Ihrer Inhalte, setzen wir einzelne Angaben in Ihrem Profil zurück oder sperren wir Ihr
            Konto, teilen wir Ihnen die Entscheidung mit einer Begründung mit. Diese nennt die getroffene Maßnahme, den
            Grund, ob wir uns auf diese Nutzungsbedingungen oder auf geltendes Recht stützen, ob eine Meldung oder eine
            eigene Prüfung Anlass war, ob dabei automatisierte Mittel eingesetzt wurden, und wie Sie widersprechen
            können. Die Mitteilung erreicht Sie im Mitteilungsbereich der App; ist Ihr Konto gesperrt und damit die App
            für Sie nicht mehr zugänglich, senden wir sie zusätzlich an Ihre hinterlegte E-Mail-Adresse. Eine Kopie
            dieser Entscheidungen ist Teil der Datenauskunft, die Sie in den Einstellungen jederzeit exportieren können.
          </p>
          <p>
            Sind Sie mit einer Entscheidung über eine Meldung, mit der Entfernung eines Ihrer Inhalte oder mit der
            Sperrung Ihres Kontos nicht einverstanden, können Sie dieser formlos per E-Mail an{" "}
            <a href="mailto:mail@janickbraun.com" className="text-brand-green-700 hover:underline">
              mail@janickbraun.com
            </a>{" "}
            widersprechen. Wir prüfen den Widerspruch und teilen Ihnen das Ergebnis mit. Die Möglichkeit, sich an eine
            Aufsichtsbehörde oder ein Gericht zu wenden, bleibt unberührt.
          </p>
          <p>
            Zu Moderations- und Sicherheitszwecken kann der Betreiber in seiner Funktion als Administrator auf sämtliche
            in der App eingestellten Inhalte zugreifen – einschließlich solcher, die nur für einen begrenzten
            Empfängerkreis (z. B. Freunde) sichtbar sind. Dieser Zugriff erfolgt ausschließlich zur Prüfung von
            Meldungen, zur Durchsetzung dieser Nutzungsbedingungen sowie zur Erfüllung gesetzlicher Pflichten und bleibt
            auf das hierfür erforderliche Maß beschränkt.
          </p>
          <p>
            Einzelheiten zur Verarbeitung personenbezogener Daten in diesem Zusammenhang finden Sie in unserer{" "}
            <Link href="/datenschutz" className="text-brand-green-700 hover:underline">
              Datenschutzerklärung
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">8. Freundschaften und Einladungslinks</h3>
          <p>
            Freundschaftsverbindungen entstehen durch Anfragen oder über persönliche Einladungslinks. Einladungslinks sind
            persönlich und nicht zur öffentlichen Verbreitung in Massenmedien bestimmt. Sie haften für den missbräuchlichen
            Gebrauch von Links, die Sie teilen.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">9. Verfügbarkeit</h3>
          <p>
            Wir bemühen uns um eine hohe Verfügbarkeit, garantieren diese jedoch nicht. Wartung, Updates oder Störungen bei
            Drittanbietern (z. B. Hosting, Karten) können zu vorübergehenden Einschränkungen führen. Die App kann sich noch in
            aktiver Entwicklung befinden; Funktionen können sich ändern.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">10. Haftung und externe Dienste</h3>
          <p>
            Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Schäden aus der Verletzung von Leben,
            Körper oder Gesundheit. Im Übrigen haften wir nur bei Verletzung wesentlicher Vertragspflichten, beschränkt auf den
            vorhersehbaren, vertragstypischen Schaden. Die vorstehende Haftungsbeschränkung gilt nicht, soweit zwingende
            gesetzliche Vorschriften entgegenstehen.
          </p>
          <p>
            Die App bindet Dienste Dritter ein, unter anderem Mapbox und Apple/Google für Kartendarstellung, Google für die
            Ortssuche und Wegbeschreibungen, Geoapify für Kartenvorschaubilder, Google und Apple für die Anmeldung sowie
            Expo, Apple und Google für die Zustellung von Push-Nachrichten. Eine vollständige Aufstellung mit den
            datenschutzrechtlichen Angaben finden Sie in unserer{" "}
            <Link href="/datenschutz" className="text-brand-green-700 hover:underline">
              Datenschutzerklärung
            </Link>
            . Für Inhalte und Verfügbarkeit externer Dienste sind deren Betreiber verantwortlich. Links zu externen
            Websites erfolgen auf eigenes Risiko des Nutzers.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">11. Kündigung</h3>
          <p>
            Sie können Ihr Konto jederzeit in den Einstellungen unter „Daten &amp; Privatsphäre“ → „Konto löschen“
            unwiderruflich beenden. Dabei werden Ihre Beiträge, Kommentare, Freundschaften und hochgeladenen Dateien
            gelöscht; von anderen Personen erstellte Weitergaben bleiben nach Maßgabe von § 6 bestehen. Vor der Löschung
            können Sie an derselben Stelle eine Kopie Ihrer Daten exportieren. Wir können Konten bei schwerwiegenden
            Verstößen gegen diese Bedingungen sperren oder löschen. Mit Kontolöschung endet Ihr Nutzungsrecht.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">12. Änderungen</h3>
          <p>
            Wir können diese Nutzungsbedingungen anpassen, wenn sachliche Gründe dies erfordern (z. B. neue Funktionen,
            Rechtsänderungen). Über wesentliche Änderungen informieren wir in der App oder per E-Mail. Widersprechen Sie nicht
            innerhalb von vier Wochen nach Mitteilung, gelten die geänderten Bedingungen als angenommen; hierauf werden wir Sie
            bei der Mitteilung hinweisen.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">13. Schlussbestimmungen</h3>
          <p>
            Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Für Verbraucher gilt diese
            Rechtswahl nur, soweit dadurch keine zwingenden Verbraucherschutzvorschriften des Staates ihres gewöhnlichen
            Aufenthalts entzogen werden. Gerichtsstand für Streitigkeiten mit Kaufleuten ist, soweit zulässig, der Sitz des
            Betreibers.
          </p>
          <p>
            Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Regelungen unberührt.
          </p>
        </section>
      </div>
    </div>
  );
}
