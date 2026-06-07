import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const contactInfo = [
  { icon: Mail, label: "Email", value: "mohamedashraf366@gmail.com", href: "mailto:m.ashraf@example.com" },
  { icon: Phone, label: "WhatsApp", value: "+20 111 116 6832", href: "https://wa.me/201111166832" },
  { icon: MapPin, label: "Location", value: "Egypt", href: "#" },
];

const Contact: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappMsg = `Hello Mohamed! I'm ${form.name}.\n\nEmail: ${form.email}\n\n${form.message}`;
    const url = `https://wa.me/201111166832?text=${encodeURIComponent(whatsappMsg)}`;
    window.open(url, "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <section id="contact" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-amber-400 text-sm tracking-widest uppercase">Get in touch</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mt-3">
            Let's <span className="gradient-text">Connect</span>
          </h2>
          <p className="text-slate-400 font-body mt-4 max-w-xl mx-auto">
            Have a project in mind? I'd love to hear about it. Send me a message and I'll get back to you as soon as possible.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left — info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h3 className="font-display font-bold text-2xl text-white mb-2">Let's build something great</h3>
              <p className="text-slate-400 font-body leading-relaxed">
                I'm a Communication Engineer turned Fullstack Developer. I'm passionate about building elegant, performant web experiences.
              </p>
            </div>

            <div className="space-y-4">
              {contactInfo.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl glass border border-white/5 hover:border-cyan-500/30 hover:bg-white/5 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-mono">{item.label}</p>
                    <p className="text-white font-body font-medium">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Social */}
            <div>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-4">Find me online</p>
              <div className="flex gap-3">
                {[
                  { icon: "fab fa-github", href: "https://github.com/MohamedAshraf366" },
                  { icon: "fab fa-linkedin", href: "https://www.linkedin.com/in/mohamed-ashraf-497a13170" },
                  { icon: "fab fa-facebook", href: "https://www.facebook.com/mohamed.ashraf.791060/" },
                  { icon: "fab fa-whatsapp", href: "https://wa.me/201111166832" },
                ].map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="w-11 h-11 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all duration-300"
                  >
                    <i className={`${s.icon} text-sm`} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.form
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            onSubmit={handleSubmit}
            className="glass rounded-3xl p-8 border border-white/5 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 font-body focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 font-body focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell me about your project..."
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 font-body focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium font-body bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              {sent ? "✓ Message Sent!" : (<><Send size={18} /> Send Message</>)}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
