<script setup>
import activities from '@/data/activities'

const oncampusActivities = activities.filter((item) => item.category === 'oncampus')
const offcampusActivities = activities.filter((item) => item.category === 'offcampus')
</script>

<template>
  <section id="activity" class="section">
    <h2 class="section-title">Activities</h2>

    <div id="activity-oncampus" class="activity-sub">
      <h3 class="activity-sub-title">교내 활동</h3>
      <ul class="activity-list">
        <li v-for="item in oncampusActivities" :id="item.id" :key="item.id" class="activity-card">
          <h4 class="activity-title">{{ item.title }}</h4>
          <p class="activity-description">{{ item.description }}</p>
        </li>
      </ul>
    </div>

    <div id="activity-offcampus" class="activity-sub">
      <h3 class="activity-sub-title">교외 활동</h3>
      <ul class="activity-list">
        <li v-for="item in offcampusActivities" :id="item.id" :key="item.id" class="activity-card">
          <h4 class="activity-title">{{ item.title }}</h4>
          <p class="activity-description">{{ item.description }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.activity-sub {
  min-height: 50vh;
}

.activity-sub-title {
  margin-bottom: 24px;
  font-size: 18px;
  font-weight: 700;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-card {
  padding: 20px;
  border: 0.5px solid var(--color-border);
  border-radius: 8px;
}

.activity-title {
  margin-bottom: 4px;
  font-size: 16px;
  font-weight: 600;
}

.activity-description {
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.6;
}
</style>
