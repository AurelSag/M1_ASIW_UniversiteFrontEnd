<script setup lang="ts">
import { ref, onMounted } from 'vue';

import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';

import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';

import ParcoursForm from '@/presentation/components/forms/ParcoursForm.vue';

import CustomTable from '../components/tables/CustomTable.vue';

import { Parcours } from '@/domain/entities/Parcours';

import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';

import Swal from 'sweetalert2';

const parcours = ref<Parcours[]>([]);
const parcoursForm = ref();

const formatterEdition = (parcours: Parcours) => {
  return '<i class="bi bi-pen-fill text-primary"></i>';
};

const formatterSuppression = (parcours: Parcours) => {
  return '<i class="bi bi-trash-fill text-danger"></i>';
};

const columns = [
  {
    field: 'EditionParcours',
    label: 'Edition',
    formatter: formatterEdition,
    onClick: (p: Parcours) => parcoursForm.value?.openForm(p),
    style: 'width: 32px;text-align:center;'
  },
  { field: 'ID', label: 'ID', formatter: null, onClick: null, style: null },
  { field: 'NomParcours', label: 'Intitulé', formatter: null, onClick: null, style: null },
  { field: 'AnneeFormation', label: 'Année', formatter: null, onClick: null, style: null },
  {
    field: 'DeleteParcours',
    label: 'Suppression',
    formatter: formatterSuppression,
    onClick: (p: Parcours) => onDeleteParcours(p),
    style: 'width: 32px;text-align:center;'
  }
];

onMounted(() => {
  ParcoursDAO.getInstance()
    .list()
    .then((data) => {
      parcours.value = data;
    });
});

const onParcoursCreated = (newParcours: Parcours) => {
  parcours.value.unshift(newParcours);
};

const onParcoursUpdated = (update: { message: string; parcours: Parcours }) => {
  const index = parcours.value.findIndex((p) => p.ID === update.parcours.ID);
  if (index !== -1) {
    parcours.value[index] = update.parcours;
  }
};

const onDeleteParcours = (p: Parcours) => {
  Swal.fire({
    title: 'Êtes-vous sûr de vouloir supprimer ce parcours ?',

    showCancelButton: true,

    confirmButtonText: 'Supprimer',

    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      ParcoursDAO.getInstance()
        .delete(p.ID!)
        .then(() => {
          parcours.value = parcours.value.filter((parcours) => parcours.ID !== p.ID);
        })
        .catch(() => {
          alert('Une erreur est survenue lors de la suppression du parcours');
        });
    }
  });
};
</script>

<template>
  <div class="container-fluid">
    <div class="card mt-5">
      <div class="card-header d-flex flex-row">
        <div class="card-title">
          <h4>Liste des parcours</h4>
        </div>
        <CustomButton
          :color="BootstrapButtonEnum.info"
          @click="() => parcoursForm?.openForm()"
          style="justify-self: flex-end; margin-left: auto"
          class="justify-"
        >
          Ajouter un parcours
        </CustomButton>
      </div>
      <div class="card-body">
        <CustomTable idAttribute="ID" :columns="columns" :data="parcours" />
      </div>
    </div>
  </div>

  <ParcoursForm
    ref="parcoursForm"
    :parcours="null"
    @create:parcours="onParcoursCreated"
    @update:parcours="onParcoursUpdated"
  />
</template>