<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col class="text-center" cols="12" sm="8" md="6">
        <v-icon color="warning" icon="mdi-lock-alert" size="64" />
        <h1 class="text-h4 mt-4">Access Denied</h1>
        <p class="text-body-1 mt-2">
          Your account doesn't have permission to view this page.
        </p>
        <v-btn class="mt-4" color="primary" to="/">
          Back to Dashboard
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>