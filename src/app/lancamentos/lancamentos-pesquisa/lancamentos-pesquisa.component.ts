import { Component, ViewChild } from '@angular/core';

import { LazyLoadEvent, MessageService, ConfirmationService } from 'primeng/api';

import { LancamentoService, LancamentoPesquisaInterface } from './../lancamento.service';
import { ErrorHandlerService } from './../../core/error-handler.service';
import { Utils } from 'src/app/core/Utils';

//TODO: Refatorar o código para componentizar o grid, se achar necessário.
class LancamentoPesquisa implements LancamentoPesquisaInterface {

  id!: number;
  descricao!: string;
  vencimento!: Date;
  vencimentoAte!: Date;
  number=0;
  size=3;
  totalElements=0;
  first=true;
  last=true;
  content: any;

}

@Component({
  selector: 'app-lancamentos-pesquisa',
  templateUrl: './lancamentos-pesquisa.component.html',
  styleUrls: ['./lancamentos-pesquisa.component.css']
})
export class LancamentosPesquisaComponent {

  lancamentoPesquisa = new LancamentoPesquisa;

  loading=true;

  @ViewChild('tabela') grid:any;

  constructor(

    private lancamentoService: LancamentoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private errorHandlerService: ErrorHandlerService

  ) { }

  pesquisar(pagina = 0) {

    this.loading = true;

    this.lancamentoPesquisa.number = pagina;

    this.lancamentoService.pesquisar(this.lancamentoPesquisa).then(
      result => {

        this.lancamentoPesquisa = result;

        this.mostrarPaginacao();

        this.loading = false;

      })
      .catch(
        error => {

          if (typeof error === 'string')
            this.errorHandlerService.handler(error);
          else
            this.errorHandlerService.handler(`Ocorreu um erro ao acessar servidor remoto [lancamentos-pesquisa-componente: linha 68.]!`);

        }
      );

  }

  mudarPagina(event: LazyLoadEvent) {

    this.loading = true;

    const first = event.first ? event.first : 0;
    const rows = event.rows?event.rows:1;
    const pagina = (first / rows);

    this.pesquisar(pagina);

  }

  mostrarPaginacao():boolean {

    return !(this.lancamentoPesquisa.first && this.lancamentoPesquisa.last);

  }

  mostrarResultado(lancamentoPesquisa: LancamentoPesquisaInterface) {

    this.lancamentoPesquisa = lancamentoPesquisa;

  }

  confirmarExclusao(lancamento:any, event: Event) {

      this.confirmationService.confirm({

        target: event.target!,

        message: 'Tem certeza que deseja EXCLUIR?',
        icon: 'pi pi-exclamation-triangle p-text-warning',

        acceptLabel: 'Confirmar',
        acceptButtonStyleClass: 'p-button-icon p-button-warning',
        acceptIcon:'pi pi-check',

        rejectLabel: 'Cancelar',
        rejectButtonStyleClass:'p-button-icon',
        rejectIcon:'pi pi-times',

        accept: () => this.excluir(lancamento),
        reject: () => this.messageService.add({

          severity: 'info',
          summary: 'Exclusão cancelada.',
          detail: `O lançamento, ${lancamento.descricao}, no valor de ${Utils.formatCurrency(lancamento.valor)} foi mantido.`

        })

      });

  }

  excluir(lancamento: any) {

    this.lancamentoService.excluir(lancamento.id).then(response => {

      if ( response!=null && !(undefined === response['status']) && (response['status'] > 300)) {

        if (typeof response === 'string')
          this.errorHandlerService.handler(response);
        else {

          response['error'].forEach((mensagem: any) => {

            this.errorHandlerService.handler(`O lançamento ${lancamento.descricao}, no valor de R$ ${Utils.formatCurrency(lancamento.valor)} não pode ser excluído! [${mensagem['mensagemUsuario']}]`);
            console.log(mensagem['mensagemDesenvolvedor']);

          });

        }

      } else {

        if (this.grid.first === 0)
          this.pesquisar();
        else
        this.grid.reset();

        this.messageService.add({

          severity: 'success',
          summary: 'Operação realizada com sucesso.',
          detail: `O lançamento ${lancamento.descricao}, no valor de R$ ${Utils.formatCurrency(lancamento.valor)} foi excluído.`

        });

      }

    })
      .catch(error => {

        if (typeof error === 'string')
          this.errorHandlerService.handler(error);
        else
          this.errorHandlerService.handler(`O lançamento ${lancamento.descricao}, no valor de R$ ${Utils.formatCurrency(lancamento.valor)} não pode ser excluído!`);

      });
  }

}
