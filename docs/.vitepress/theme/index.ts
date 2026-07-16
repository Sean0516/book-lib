import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import HomeDashboard from './HomeDashboard.vue'
import LearningToolbar from './LearningToolbar.vue'
import TrainingDashboard from './TrainingDashboard.vue'
import ProjectDefense from './training/ProjectDefense.vue'
import SystemDesignInterview from './training/SystemDesignInterview.vue'
import LeadershipInterview from './training/LeadershipInterview.vue'
import TrainingHistory from './training/TrainingHistory.vue'
import './custom.css'
import './theme-refresh.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'doc-before': () => h(LearningToolbar)
  }),
  enhanceApp({ app }) {
    app.component('HomeDashboard', HomeDashboard)
    app.component('TrainingDashboard', TrainingDashboard)
    app.component('ProjectDefense', ProjectDefense)
    app.component('SystemDesignInterview', SystemDesignInterview)
    app.component('LeadershipInterview', LeadershipInterview)
    app.component('TrainingHistory', TrainingHistory)
  }
}
