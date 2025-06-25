'use client'

import { motion } from 'framer-motion'

const skills = [
  // Programming Languages & Frameworks
  'JavaScript', 'Next.js', 'Python', 'Docker', 'Git/GitHub',
  // Cloud & Services
  'GAS', 'GCP', 'AWS', 'Supabase', 'Vercel',
  // Tools & APIs
  'Google Workspace', 'PostgreSQL', '各種API連携'
]

export default function AboutMe() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20 font-sans">
      <div className="max-w-6xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-thin text-cyan-400 mb-6">
            About Me
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            AIとプログラミングの力で、学習を可視化し、成長を加速させる開発者
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 border border-gray-800"
          >
            <h3 className="text-2xl font-semibold text-cyan-400 mb-6">Profile</h3>
            <div className="space-y-4 text-gray-300">
              <p>
                現在、創業として Web 開発に取り組みながら、本業への転換を
                目指している開発者です。AI技術の急速な発展に魅力を感じ、
                ChatGPT や Claude などのツールを積極的に学習に活用してい
                ます。
              </p>
              <p>
                特に、<span className="text-cyan-400">学習プロセスの可視化</span>と効率化に興味があり、自身の成
                長を数値化・グラフ化することで、より効果的な学習方法を模
                索しています。
              </p>
              <p>
                技術的な挑戦だけでなく、<span className="text-purple-400">ビジネス価値の創出</span>も重視し、実用
                的なアプリケーション開発を通じて実践的なスキルを身につけ
                ています。
              </p>
            </div>
          </motion.div>

          {/* Technical Skills Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 border border-gray-800"
          >
            <h3 className="text-2xl font-semibold text-cyan-400 mb-6">Technical Skills</h3>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full border border-gray-700 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}