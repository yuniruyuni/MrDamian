import { type Environment } from '../../model/variable';
import { type ComponentParameters } from '../../model/parameters';
import { Component } from '../../model/component';

type TranslateParametes = ComponentParameters;

export class Translate extends Component<TranslateParametes> {
    public run(envs: TranslateParametes): Environment {
        // TODO: implement
        console.log("translate component is running with", envs);
        return {};
    }
}
