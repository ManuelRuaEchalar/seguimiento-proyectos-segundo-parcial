import { Component } from "react";
import styles from "../style/Tip.module.css";

interface State {
  compact: boolean;
  text: string;
  observacionId: string;
}

interface Props {
  onConfirm: (comment: { text: string; observacionId: string }) => void;
  onOpen: () => void;
  onUpdate?: () => void;
  observaciones: any[] | null;
}

export class TipCor extends Component<Props, State> {
  state: State = {
    compact: true,
    text: "",
    observacionId: "",
  };

  // for TipContainer
  componentDidUpdate(_: Props, nextState: State) {
    const { onUpdate } = this.props;

    if (onUpdate && this.state.compact !== nextState.compact) {
      onUpdate();
    }
  }

  render() {
    const { onConfirm, onOpen, observaciones } = this.props;
    const { compact, text, observacionId } = this.state;

    return (
      <div>
        {compact ? (
          <div
            className={styles.compact}
            onClick={() => {
              onOpen();
              this.setState({ compact: false });
            }}
          >
            Add highlight
          </div>
        ) : (
          <form
            className={styles.card}
            onSubmit={(event) => {
              event.preventDefault();
              onConfirm({ text, observacionId });
            }}
          >
            <div className={styles.formGroup}>
              <label className={styles.label}>Seleccione la observación que se corrige</label>
              <select
                className={styles.select}
                value={observacionId}
                onChange={(event) =>
                  this.setState({ observacionId: event.target.value })
                }
                required
              >
                <option value="" disabled>
                  Seleccione la observación que se corrige
                </option>
                {(observaciones || []).map((obs) => (
                  <option key={obs.id} value={obs.id}>
                    {obs.content_text || obs.contentText || "Sin texto"}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <textarea
                className={styles.textarea}
                placeholder="Your comment"
                autoFocus
                value={text}
                onChange={(event) =>
                  this.setState({ text: event.target.value })
                }
                ref={(node) => {
                  if (node) {
                    node.focus();
                  }
                }}
              />
            </div>
            <div className={styles.formActions}>
              <input type="submit" value="Save" />
            </div>
          </form>
        )}
      </div>
    );
  }
}