import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import HomeDashboard from './HomeDashboard.vue'
import LearningToolbar from './LearningToolbar.vue'
import TrainingDashboard from './TrainingDashboard.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'doc-before': () => h(LearningToolbar)
  }),
  enhanceApp({ app }) {
    app.component('HomeDashboard', HomeDashboard)
    app.component('TrainingDashboard', TrainingDashboard)
  }
}
