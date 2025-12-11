<script setup lang="ts">
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import CustomTable from '@/presentation/components/tables/CustomTable.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import { Parcours } from '@/domain/entities/Parcours';

const columns = [
  { field: 'ID', label: 'ID', formatter: null, onClick: null, style: null },
  { field: 'NomParcours', label: 'Intitulé', formatter: null, onClick: null, style: null },
  { field: 'AnneeFormation', label: 'Année', formatter: null, onClick: null, style: null }
];
</script>

<template>
  <div class="container-fluid">
    <div class="card mt-5">
      <div class="card-header d-flex flex-row">
        <div class="card-title">
          <h4>Liste des UEs</h4>
        </div>
        <CustomButton
          :color="BootstrapButtonEnum.info"
          @click="() => ueForm?.openForm()"
          style="justify-self: flex-end; margin-left: auto"
          class="justify-"
        >
          Ajouter un parcours
        </CustomButton>
      </div>
      <div class="card-body">
        <CustomTable idAttribute="ID" :columns="columns" :data="ues" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>