<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import EtudiantForm from '@/presentation/components/forms/EtudiantForm.vue';
import CustomTable from '../components/tables/CustomTable.vue';
import { Etudiant } from '@/domain/entities/Etudiant';
import { EtudiantDAO } from '@/domain/daos/EtudiantDAO';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import type { Parcours } from '@/domain/entities/Parcours';
import Swal from 'sweetalert2';

const etudiantForm = ref<typeof EtudiantForm | null>(null);
const etudiants = ref<Etudiant[]>([]);
const mapParcours = ref<Map<number, string>>(new Map());

const formatterEdition = (etudiant: Etudiant) => {
  return '<i class="bi bi-pen-fill text-primary"></i>';
};

const formatterSuppression = (etudiant: Etudiant) => {
  return '<i class="bi bi-trash-fill text-danger"></i>';
};

// Fonction pour traduire l'ID du parcours en Nom de parcours
const formatterParcours = (etudiant: Etudiant) => {
  if (etudiant.parcours_id && mapParcours.value.has(etudiant.parcours_id)) {
    return mapParcours.value.get(etudiant.parcours_id);
  }
  return 'Non assigné';
};

onMounted(async () => {
  // 1. On charge les parcours pour pouvoir afficher leurs noms
  try {
    const parcoursList = await ParcoursDAO.getInstance().list();
    parcoursList.forEach((p) => {
      if (p.ID) mapParcours.value.set(p.ID, p.NomParcours);
    });
  } catch (e) {
    console.error('Erreur chargement parcours', e);
  }

  // 2. On charge les étudiants
  EtudiantDAO.getInstance()
    .list()
    .then((data) => {
      etudiants.value = data;
    });
});

const onEtudiantCreated = (newEtudiant: Etudiant) => {
  etudiants.value.unshift(newEtudiant);
};

const onEtudiantUpdated = (updatedEtudiant: { etudiant: Etudiant }) => {
  const index = etudiants.value.findIndex((e) => e.ID === updatedEtudiant.etudiant.id);
  if (index !== -1) {
    etudiants.value[index] = updatedEtudiant.etudiant;
  }
};

const onDeleteEtudiant = (e: Etudiant) => {
  Swal.fire({
    title: 'Êtes-vous sûr de vouloir supprimer cet étudiant ?',
    showCancelButton: true,
    confirmButtonText: 'Supprimer',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      EtudiantDAO.getInstance()
        .delete(e.ID!)
        .then(() => {
          etudiants.value = etudiants.value.filter((et) => et.ID !== e.ID);
        })
        .catch(() => {
          alert('Une erreur est survenue lors de la suppression');
        });
    }
  });
};

const columns = [
  {
    field: 'EditionEtudiant',
    label: 'Edition',
    formatter: formatterEdition,
    onClick: (e: Etudiant) => etudiantForm.value?.openForm(e),
    style: 'width: 32px;text-align:center;'
  },
  { field: 'ID', label: 'ID', formatter: null, onClick: null, style: null },
  { field: 'nom', label: 'Nom', formatter: null, onClick: null, style: null },
  { field: 'prenom', label: 'Prénom', formatter: null, onClick: null, style: null },
  { field: 'email', label: 'Email', formatter: null, onClick: null, style: null },
  {
    field: 'parcours_id',
    label: 'Parcours',
    formatter: formatterParcours,
    onClick: null,
    style: null
  },
  {
    field: 'DeleteEtudiant',
    label: 'Suppression',
    formatter: formatterSuppression,
    onClick: onDeleteEtudiant,
    style: 'width: 32px;text-align:center;'
  }
];
</script>

<template>
  <div class="container-fluid">
    <div class="card mt-5">
      <div class="card-header">
        <div class="card-title">
          <h4>Liste des étudiants</h4>
        </div>
        <CustomButton :color="BootstrapButtonEnum.info" @click="() => etudiantForm?.openForm()">
          Ajouter un étudiant
        </CustomButton>
      </div>
      <div class="card-body">
        <CustomTable idAttribute="ID" :columns="columns" :data="etudiants" />
      </div>
    </div>
  </div>
  <EtudiantForm
    ref="etudiantForm"
    :etudiant="null"
    @create:etudiant="onEtudiantCreated"
    @update:etudiant="onEtudiantUpdated"
  />
</template>