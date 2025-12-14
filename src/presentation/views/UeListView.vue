<script setup lang="ts">
import { ref, onMounted } from 'vue';

import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';

import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';

import UeForm from '@/presentation/components/forms/UEForm.vue';

import CustomTable from '../components/tables/CustomTable.vue';

import { UE } from '@/domain/entities/UE';

import { UEDAO } from '@/domain/daos/UEDAO';

import Swal from 'sweetalert2';

const ues = ref<UE[]>([]);
const ueForm = ref();

const formatterEdition = (ue: UE) => {
    return '<i class="bi bi-pen-fill text-primary"></i>';
};

const formatterSuppression = (ue: UE) => {
    return '<i class="bi bi-trash-fill text-danger"></i>';
};

const columns = [
    {
        field: 'EditionUe',
        label: 'Edition',
        formatter: formatterEdition,
        onClick: (u: UE) => ueForm.value?.openForm(u),
        style: 'width: 32px;text-align:center;'
    },
    { field: 'ID', label: 'ID', formatter: null, onClick: null, style: null },
    { field: 'NumeroUe', label: 'Numéro', formatter: null, onClick: null, style: null },
    { field: 'Intitule', label: 'Intitulé', formatter: null, onClick: null, style: null },
    {
        field: 'DeleteUe',
        label: 'Suppression',
        formatter: formatterSuppression,
        onClick: (u: UE) => onDeleteUe(u),
        style: 'width: 32px;text-align:center;'
    }
];

onMounted(() => {
    UEDAO.getInstance()
        .list()
        .then((data) => {
            ues.value = data;
        });
});

const onUeCreated = (newUe: UE) => {
    ues.value.unshift(newUe);
};

const onUeUpdated = (ue: UE) => {
    const index = ues.value.findIndex((u) => u.ID === ue.ID);
    if (index !== -1) {
        ues.value[index] = ue;
    }
};

const onDeleteUe = (u: UE) => {
    Swal.fire({
        title: 'Êtes-vous sûr de vouloir supprimer cette UE ?',
        showCancelButton: true,
        confirmButtonText: 'Supprimer',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            UEDAO.getInstance()
                .delete(u.ID!)
                .then(() => {
                    ues.value = ues.value.filter((ue) => ue.ID !== u.ID);
                })
                .catch(() => {
                    alert('Une erreur est survenue lors de la suppression de l\'UE');
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
                    <h4>Liste des UEs</h4>
                </div>
                <CustomButton
                    :color="BootstrapButtonEnum.info"
                    @click="() => ueForm?.openForm()"
                    style="justify-self: flex-end; margin-left: auto"
                    class="justify-"
                >
                    Ajouter une UE
                </CustomButton>
            </div>
            <div class="card-body">
                <CustomTable idAttribute="ID" :columns="columns" :data="ues" />
            </div>
        </div>
    </div>

    <UeForm
        ref="ueForm"
        :ue="null"
        @create:ue="onUeCreated"
        @update:ue="onUeUpdated"
    />
</template>